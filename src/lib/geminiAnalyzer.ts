import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

//주어진 텍스트를 제미나이 분석 후 핵심 요약 단어 추출
export async function getKeywordsFromText(text: string) {
  console.log(text);
  if (!text || text.trim() === "") {
    return "";
  }

  const prompt = `
    Analyze the following text and provide a **single keyword** that best represents its **core theme or most important content**. **The keyword must be in the same language as the original text.** You need to identify the language of the original text and return the keyword(s) in the **identical language**.
    If the text is too complex or contains multiple core themes, provide **up to 3 of the most important keywords, separated by commas**.

    Keywords should be concise single words or compound words, not phrases or sentences. They can include abstract concepts not directly present in the text (e.g., "반전" (Reversal), "놀라움" (Surprise), "도전" (Challenge), "경험" (Experience), "문화충격" (Culture Shock)) or concrete core subjects from the text (e.g., "건축물" (Architecture), "사람들" (People)).

    Text: """
    ${text}
    """

    Example response 1: 반전
    Example response 2: 사과
    Example response 3 (English text, English keyword): Growth
    Example response 4: 문화충격, 다양성, 친절
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log(responseText);

    // // 응답 텍스트에서 핵심 단어만 파싱
    // const keywords = responseText
    //   .split(",") // 쉼표로 분리
    //   .map((word) => word.trim()) // 각 단어의 앞뒤 공백 제거
    //   .filter((word) => word.length > 0); // 빈 문자열 제거

    return responseText;
  } catch (error) {
    //실패한 경우 빈 문자열을 리턴
    console.log(error);
    return "";
  }
}
