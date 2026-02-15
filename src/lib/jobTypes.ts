export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Casual",
  "Apprenticeship/Traineeship",
  "Subcontractor",
  "Labour Hire",
] as const;

export const JOB_TYPE_COLORS: Record<string, string> = {
  "Full-time": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Part-time": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Contract": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "Casual": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "Apprenticeship/Traineeship": "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  "Subcontractor": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "Labour Hire": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const DEFAULT_JOB_TYPE_COLOR = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";

export function getJobTypeColor(jobType: string): string {
  return JOB_TYPE_COLORS[jobType] || DEFAULT_JOB_TYPE_COLOR;
}
