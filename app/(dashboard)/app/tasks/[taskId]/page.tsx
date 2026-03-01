import { TaskDetailView } from "@/components/task/task-detail-view";

type TaskDetailPageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = await params;
  return <TaskDetailView taskId={taskId} />;
}
