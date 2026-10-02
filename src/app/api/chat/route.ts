import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { homedir } from "os";
import { join } from "path";
import { readFileSync } from "fs";

export const runtime = "nodejs";

const BASE_URL = "https://opencode.ai/zen/go/v1";
const MODEL = "deepseek-v4.1-flash";

const SYSTEM_PROMPT = `You are the AI analyst embedded in a B.Tech Statistics and Probability project about IMDb Top 1000 movie ratings.
You explain statistical and machine-learning results in clear, exam-ready language. Be precise, cite numbers when given, and never invent data. Keep answers under 200 words unless asked for more.`;

const PROJECT_CONTEXT = `Dataset: 1,000 IMDb top-rated movies. Mean rating 7.95 (SD 0.28, left-skewed, not Normal).
Strongest correlations with rating: log(votes) r=0.46, Metascore r=0.28, runtime r=0.26, year r=-0.18, gross r=0.13.
Hypothesis tests: mean rating != 8.0 (p~0); high-Metascore films rate higher (p~0); genre ANOVA p=0.058; chi-square genre vs rating tier p=0.12.
Regression: multiple OLS R2=0.40, hold-out R2=0.36, MAE=0.187. Best ML model: Gradient Boosting, 5-fold CV R2=0.542.
SHAP: popularity (votes) is the dominant predictor, then gross, year, Metascore, runtime.`;

function readKey(): string | undefined {
  if (process.env.OPENCODE_API_KEY) return process.env.OPENCODE_API_KEY;
  try {
    const path = join(homedir(), ".local", "share", "opencode", "auth.json");
    const auth = JSON.parse(readFileSync(path, "utf-8"));
    return auth?.["opencode-go"]?.key;
  } catch {
    return undefined;
  }
}

export async function POST(req: Request) {
  const key = readKey();
  if (!key) {
    return NextResponse.json(
      {
        error:
          "No OPENCODE_API_KEY configured. Set it in your environment (e.g. .env.local or Vercel env vars).",
      },
      { status: 200 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const mode = body.mode ?? "chat";

  let userPrompt = "";
  if (mode === "explain-prediction") {
    const contribs = (body.contributions ?? [])
      .map((c: { name: string; value: number }) => `- ${c.name}: ${c.value >= 0 ? "+" : ""}${c.value.toFixed(3)}`)
      .join("\n");
    userPrompt = `A movie was predicted to have an IMDb rating of ${Number(
      body.prediction,
    ).toFixed(2)}.
Input features: ${JSON.stringify(body.movie)}.
Feature contributions (effect on the prediction in rating points, vs dataset average):
${contribs}

Explain in plain language why the model produced this rating, which factors pushed it up or down, and whether the result is surprising.`;
  } else {
    const history = (body.history ?? [])
      .slice(-6)
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join("\n");
    userPrompt = `${PROJECT_CONTEXT}\n\nConversation so far:\n${history}\n\nUser question: ${body.prompt}`;
  }

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "x-opencode-session": `imdb-web-${randomUUID()}`,
        "User-Agent": "imdb-stats-web/1.0",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1600,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `LLM service error (${res.status}): ${text.slice(0, 300)}` },
        { status: 200 },
      );
    }

    const data = await res.json();
    const message = data?.choices?.[0]?.message;
    const content = (message?.content ?? "").trim();
    const reasoning = (message?.reasoning_content ?? "").trim();
    const answer = content || reasoning || "No response from the model.";
    return NextResponse.json({ answer });
  } catch (err) {
    return NextResponse.json(
      { error: `Request failed: ${String(err)}` },
      { status: 200 },
    );
  }
}
