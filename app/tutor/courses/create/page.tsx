import { CreateCourseForm } from "./create-course-form"

export default function CreateCoursePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Course</h1>
        <p className="text-muted-foreground mt-1">
          Your course goes live immediately once published - there&apos;s no approval queue.
        </p>
      </div>
      <CreateCourseForm />
    </div>
  )
}
