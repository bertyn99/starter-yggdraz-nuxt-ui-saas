// server/api/example/projects/create.post.ts
import { requirePlan, checkLimit } from '~/server/utils/entitlements'

export default defineEventHandler(async (event) => {
  // Require at least 'plus' plan
  await requirePlan(event, { atLeast: 'plus' })

  // Check if user hasn't exceeded project limit
  await checkLimit(event, {
    key: 'projects',
    getCurrentUsage: async () => {
      // This would be your actual project counting logic
      return 5 // example: user has 5 projects
    },
    errorMessage: 'Project limit exceeded. Please upgrade your plan.'
  })

  // If we get here, user has permission and hasn't exceeded limits
  // Proceed with creating the project...

  return {
    success: true,
    message: 'Project created successfully'
  }
})
