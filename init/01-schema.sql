-- Copyright (c) Cynthia Rey et al., All rights reserved.
-- SPDX-License-Identifier: BSD-3-Clause
--
-- Redistribution and use in source and binary forms, with or without
-- modification, are permitted provided that the following conditions are met:
--
-- 1. Redistributions of source code must retain the above copyright notice, this
--    list of conditions and the following disclaimer.
-- 2. Redistributions in binary form must reproduce the above copyright notice,
--    this list of conditions and the following disclaimer in the
--    documentation and/or other materials provided with the distribution.
-- 3. Neither the name of the copyright holder nor the names of its contributors
--    may be used to endorse or promote products derived from this software without
--    specific prior written permission.
--
-- THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
-- ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
-- WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
-- DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
-- FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
-- DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
-- SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
-- CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
-- OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
-- OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

-- PronounDB Database Schema
-- This script creates all tables for the PronounDB application
-- Database: PostgreSQL

-- =============================================================================
-- TABLE: users
-- Description: Stores user information and their profile settings
-- =============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY,
    decoration TEXT DEFAULT NULL,
    available_decorations TEXT[] NOT NULL DEFAULT '{}'
);

COMMENT ON TABLE users IS 'Stores user profiles and their decoration settings';
COMMENT ON COLUMN users.id IS 'UUID unique identifier for the user';
COMMENT ON COLUMN users.decoration IS 'Currently selected decoration for the user';
COMMENT ON COLUMN users.available_decorations IS 'Array of decoration IDs available to the user';

-- =============================================================================
-- TABLE: pronouns
-- Description: Stores pronoun sets for users in different locales
-- =============================================================================
CREATE TABLE pronouns (
    user_id UUID NOT NULL,
    locale TEXT NOT NULL,
    sets TEXT[] NOT NULL,
    
    PRIMARY KEY (user_id, locale),
    CONSTRAINT fk_pronouns_user
        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
);

COMMENT ON TABLE pronouns IS 'Stores user pronoun preferences by locale';
COMMENT ON COLUMN pronouns.user_id IS 'Reference to the user';
COMMENT ON COLUMN pronouns.locale IS 'Locale code (e.g., en, fr, de)';
COMMENT ON COLUMN pronouns.sets IS 'Array of pronoun set identifiers';

-- =============================================================================
-- TABLE: accounts
-- Description: Links external platform accounts to PronounDB users
-- =============================================================================
CREATE TABLE accounts (
    platform TEXT NOT NULL,
    account_id TEXT NOT NULL,
    account_name TEXT NOT NULL,
    user_id UUID NOT NULL,

    PRIMARY KEY (platform, account_id),
    CONSTRAINT fk_accounts_user
        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
);

COMMENT ON TABLE accounts IS 'Links external platform accounts to PronounDB users';
COMMENT ON COLUMN accounts.platform IS 'Platform identifier (e.g., discord, github, twitch)';
COMMENT ON COLUMN accounts.account_id IS 'Platform-specific account identifier';
COMMENT ON COLUMN accounts.account_name IS 'Display name on the platform';
COMMENT ON COLUMN accounts.user_id IS 'Reference to the PronounDB user';
