import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Azure AD configuration
const AZURE_AD_TENANT_ID =
  process.env.AZURE_AD_TENANT_ID || "708f7b5b-20fc-4bc8-9150-b1015a308b9c";
const AZURE_AD_CLIENT_ID = process.env.AZURE_AD_CLIENT_ID;
const AZURE_AD_CLIENT_SECRET = process.env.AZURE_AD_CLIENT_SECRET;

// Get the base URL from request headers
const getBaseUrlFromRequest = (req: NextRequest) => {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "https://yourvoice.nssfug.org:9443";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
};

export async function GET(req: NextRequest) {
  try {
    console.log("Azure AD login initiated");

    // Check if Azure AD configuration is available
    if (!AZURE_AD_CLIENT_ID) {
      console.error("Azure AD Client ID is not configured");
      const baseUrl = getBaseUrlFromRequest(req);
      return NextResponse.redirect(`${baseUrl}/?error=missing_client_id`);
    }

    // Generate a nonce and state for OIDC flow
    const nonce = uuidv4();
    const state = uuidv4();

    console.log("Generated state:", state);

    // Build the authorization URL
    const authUrl = buildAuthorizationUrl(req, nonce, state);
    console.log(`Redirecting to Azure AD: ${authUrl}`);

    // Store state in a cookie with relaxed settings to ensure it works
    const response = NextResponse.redirect(authUrl);

    // Set cookies with more permissive settings
    response.cookies.set("auth_nonce", nonce, {
      httpOnly: true,
      secure: false, // Allow non-HTTPS for development
      sameSite: "none", // Allow cross-site requests
      path: "/",
      maxAge: 60 * 15, // 15 minutes
    });

    response.cookies.set("auth_state", state, {
      httpOnly: true,
      secure: false, // Allow non-HTTPS for development
      sameSite: "none", // Allow cross-site requests
      path: "/",
      maxAge: 60 * 15, // 15 minutes
    });

    // Log the cookies being set
    console.log("Setting cookies:", {
      nonce,
      state,
      cookieHeader: response.headers.get("set-cookie"),
    });

    return response;
  } catch (error) {
    console.error("Error initiating Azure AD login:", error);
    const baseUrl = getBaseUrlFromRequest(req);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.redirect(
      `${baseUrl}/?error=login_init_failed&details=${encodeURIComponent(
        errorMessage
      )}`
    );
  }
}

// Build the authorization URL for Azure AD
function buildAuthorizationUrl(
  req: NextRequest,
  nonce: string,
  state: string
): string {
  const baseUrl = getBaseUrlFromRequest(req);
  const redirectUri = `${baseUrl}/api/auth/callback`;

  console.log(`Redirect URI: ${redirectUri}`);

  // Azure AD authorization endpoint
  const authEndpoint = `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/oauth2/v2.0/authorize`;

  // Build query parameters
  const params = new URLSearchParams({
    client_id: AZURE_AD_CLIENT_ID!,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "form_post",
    scope: "openid profile email",
    state: state,
    nonce: nonce,
  });

  return `${authEndpoint}?${params.toString()}`;
}
