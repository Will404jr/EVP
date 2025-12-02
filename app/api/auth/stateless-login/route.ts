import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

const AZURE_AD_CLIENT_ID = process.env.AZURE_AD_CLIENT_ID
const AZURE_AD_TENANT_ID = process.env.AZURE_AD_TENANT_ID

function getBaseUrlFromRequest(req: NextRequest) {
  // Explicitly use the BASE_URL environment variable if available
  if (process.env.BASE_URL) {
    console.log("Using BASE_URL from env:", process.env.BASE_URL)
    return process.env.BASE_URL
  }

  // Fallback to headers if BASE_URL is not available
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "yourvoice.nssfug.org:9443"
  const proto = req.headers.get("x-forwarded-proto") || "https"
  console.log("Base URL from headers:", `${proto}://${host}`)
  return `${proto}://${host}`
}

function buildAuthorizationUrl(req: NextRequest, nonce: string): string {
  // Use the explicit REDIRECT_URI from environment variables if available
  const redirectUri = process.env.REDIRECT_URI || `${getBaseUrlFromRequest(req)}/api/auth/callback`

  console.log(`Redirect URI: ${redirectUri}`)

  // Azure AD authorization endpoint
  const authEndpoint = `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/oauth2/v2.0/authorize`

  // Build query parameters - no state parameter for stateless flow
  const params = new URLSearchParams({
    client_id: AZURE_AD_CLIENT_ID!,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "form_post",
    scope: "openid profile email",
    nonce: nonce,
  })

  return `${authEndpoint}?${params.toString()}`
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Generate a unique nonce for the authentication request
    const nonce = uuidv4()

    // Construct the authorization URL
    const authorizationUrl = buildAuthorizationUrl(req, nonce)

    // Store the nonce in a secure, short-lived cookie
    const response = NextResponse.redirect(authorizationUrl, 302)
    response.cookies.set("auth-nonce", nonce, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 10, // 10 minutes
      path: "/api/auth/callback",
      sameSite: "lax",
    })

    return response
  } catch (error) {
    console.error("Stateless login initiation error:", error)
    return NextResponse.json({ error: "Failed to initiate stateless login" }, { status: 500 })
  }
}
