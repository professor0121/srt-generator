import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

function extractVideoId(url: string): string | null {
    try {
        const u = new URL(url);

        if (u.hostname === "youtu.be") {
            return u.pathname.slice(1);
        }

        return u.searchParams.get("v");
    } catch {
        return null;
    }
}

function srtTimestamp(seconds: number): string {
    const ms = Math.round(seconds * 1000);

    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const milli = ms % 1000;

    const pad = (n: number, len = 2) =>
        String(n).padStart(len, "0");

    return `${pad(h)}:${pad(m)}:${pad(s)},${pad(milli, 3)}`;
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        const videoId = extractVideoId(url);

        if (!videoId) {
            return NextResponse.json(
                { error: "Invalid YouTube URL" },
                { status: 400 }
            );
        }

        const transcript =
            await YoutubeTranscript.fetchTranscript(videoId);

        const srt = transcript
            .map((item, index) => {
                const start = item.offset / 1000;
                const end =
                    start + item.duration / 1000;

                return `${index + 1}
${srtTimestamp(start)} --> ${srtTimestamp(end)}
${item.text}
`;
            })
            .join("\n");

        return NextResponse.json({
            videoId,
            srt,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                error:
                    error.message ||
                    "Failed to fetch transcript",
            },
            { status: 500 }
        );
    }
}