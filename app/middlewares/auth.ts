export default defineNuxtRouteMiddleware(() => {
    const { loggedIn, fetch } = useUserSession()

    if (!loggedIn.value) {
        // refetch the user session
        fetch()

        if (loggedIn.value) return

        // if the user is not logged in, redirect to the login page
        return navigateTo('/login')
    }
})