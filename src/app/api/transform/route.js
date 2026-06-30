import { GoogleGenerativeAI } from "@google/generative-ai";

function buildInstructions(mode, target, tone) {
const base = "You are a helpful writing assistant. Be clear, concise and your responses should be easily resuable. Do not add extra commentary.";

    if (mode === "summarize") {
        return `${base} Summarize the given text into a maximum of 5 bullet points `;
    }
    else if (mode === "rewrite") {
        return `${base} Rewrite the given text into a ${tone ? tone : "simple"} tone. You should preserve the meaning.`;
    }
    else {
        return `${base} Translate the given statements to ${target}. Do not change the names or products mentioned.`;
    }
}

/* Retry */
async function retry(fn, times = 2) {
  let error;

  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (e) {
      error = e;

      // only retry for rate limits
      if (e.status !== 429) throw e;

      console.log(`Retrying... attempt ${i + 1}`);

      await new Promise((r) =>
        setTimeout(r, 2000 * (i + 1))
      );
    }
  }

  throw error;
}

export async function POST(req) {
    try {
        const {input, mode, target, tone} = await req.json();

        const cleanedInput = input ? input.trim() : "";

        if(!cleanedInput) {
            return Response.json({error: "Text required"}, {status: 400});
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        const result = await retry(() => 
         model.generateContent({
            contents: [
                {
                role: "user",
                parts: [
                    {
                    text: cleanedInput,
                    },
                ],
                },
            ],
            systemInstruction: buildInstructions(mode, target, tone),
        }));

        return Response.json({
            output: result.response.text(),
        });
    }    
    catch(err) {
        console.error(err);

        if(err.status === 429) {
            return Response.json(
                { error: "Rate limit exceeded. Please try again later." },
                { status: 429 }
            );
        }

        if (e?.status !== 429) throw e;

        return Response.json(
            { error: err.message || "Server Error" },
            { status: 500 }
        );
    }
}