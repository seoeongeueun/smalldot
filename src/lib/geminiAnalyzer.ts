import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

//주어진 텍스트를 제미나이 분석 후 핵심 요약 단어 추출
export async function getKeywordsFromText(text: string) {
  if (!text || text?.trim() === "") {
    return "";
  }

  const splitText = text.trim().split(" ");
  //한 단어인 경우 검사 필요 없이 그대로 반환
  if (splitText.length < 2) return splitText[0];

  const prompt = `
    Analyze the following text and provide a **single keyword** that best represents its **core theme or most important content**. **The keyword must be in the same language as the original text.** You need to identify the language of the original text and return the keyword(s) in the **identical language**.
    Keywords should be a concise single word, not phrases or sentences. They can include abstract concepts not directly present in the text (e.g., "반전" (Reversal), "놀라움" (Surprise), "도전" (Challenge), "경험" (Experience), "문화충격" (Culture Shock)) or concrete core subjects from the text (e.g., "건축물" (Architecture), "사람들" (People)).

    Text: """
    ${text}
    """

    Example response 1: 반전
    Example response 2: 사과
    Example response 3 (English text, English keyword): Growth
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().split(" ")[0]; //혹시 하나 이상의 단어가 반환될 경우를 대비해 무조건 첫 단어만 반환

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
