-- Create oidc_states table for storing temporary OIDC flow data
CREATE TABLE IF NOT EXISTS public.oidc_states (
    id BIGSERIAL PRIMARY KEY,
    state TEXT NOT NULL UNIQUE,
    nonce TEXT NOT NULL,
    code_verifier TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Create index on state for faster lookups
CREATE INDEX IF NOT EXISTS idx_oidc_states_state ON public.oidc_states(state);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_oidc_states_expires_at ON public.oidc_states(expires_at);

-- Add comment
COMMENT ON TABLE public.oidc_states IS 'Temporary storage for OIDC authentication flow state, nonce, and PKCE verifier';
