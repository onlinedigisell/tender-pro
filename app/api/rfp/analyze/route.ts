import { PDFParse } from "pdf-parse";
import { prisma } from "../../../../lib/prisma";
import { analyzeRfp } from "../../../../lib/rfpAnalyzer";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return Response.json({ error: "Please upload one PDF file." }, { status: 400 });
    }

    if (!uploadedFile.name.toLowerCase().endsWith(".pdf")) {
      return Response.json({ error: "Only PDF files are supported right now." }, { status: 400 });
    }

    const buffer = Buffer.from(await uploadedFile.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    const text = parsed.text ?? "";

    if (text.trim().length < 80) {
      return Response.json(
        {
          error:
            "This PDF text could not be read. It may be a scanned image PDF. Please upload a text PDF.",
        },
        { status: 422 },
      );
    }

    const analysis = analyzeRfp({ fileName: uploadedFile.name, text });
    const saved = await prisma.rfpAnalysis.create({ data: analysis });

    return Response.json(saved);
  } catch (error) {
    console.error("RFP analysis failed", error);
    return Response.json(
      { error: "RFP analysis failed. Please try another PDF file." },
      { status: 500 },
    );
  }
}
