import { PDFParse } from "pdf-parse";
import { prisma } from "../../../../lib/prisma";
import { analyzeRfp } from "../../../../lib/rfpAnalyzer";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const uploadedFiles = formData.getAll("files");
    const fallbackFile = formData.get("file");
    const files = uploadedFiles.length > 0 ? uploadedFiles : fallbackFile ? [fallbackFile] : [];

    if (files.length === 0 || !files.every((file) => file instanceof File)) {
      return Response.json({ error: "Please upload at least one PDF file." }, { status: 400 });
    }

    if (files.some((file) => file instanceof File && !file.name.toLowerCase().endsWith(".pdf"))) {
      return Response.json({ error: "Only PDF files are supported for RFP analysis right now." }, { status: 400 });
    }

    if (files.some((file) => file instanceof File && file.size > 25 * 1024 * 1024)) {
      return Response.json({ error: "Each PDF must be below 25 MB." }, { status: 400 });
    }

    const textParts: string[] = [];
    const fileNames: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;
      fileNames.push(file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      const parsed = await parser.getText();
      await parser.destroy();
      textParts.push(`Document: ${file.name}\n${parsed.text ?? ""}`);
    }

    const text = textParts.join("\n\n");

    if (text.trim().length < 80) {
      return Response.json(
        {
          error:
            "This PDF text could not be read. It may be a scanned image PDF. Please upload a text PDF.",
        },
        { status: 422 },
      );
    }

    const analysis = analyzeRfp({ fileName: fileNames.join(", "), text });
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
