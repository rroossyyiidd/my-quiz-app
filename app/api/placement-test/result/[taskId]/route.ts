import { getResultsStore } from "../../_store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const store = getResultsStore();
    const result = store.get(taskId);

    if (!result) {
      return Response.json(
        { success: false, message: "Result not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: result,
    });
  } catch {
    return Response.json(
      { success: false, message: "Failed to fetch result" },
      { status: 500 }
    );
  }
}
