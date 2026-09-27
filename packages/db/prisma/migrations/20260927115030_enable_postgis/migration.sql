-- CreateExtension
-- PostGIS backs the nearby-books query (ST_Distance on geography). It was only enabled by the
-- postgis Docker image on the default database and by hand on Neon, so databases created by
-- `migrate deploy` (test, e2e, new environments) lacked it. IF NOT EXISTS makes this a no-op
-- where it is already enabled. Kept as its own migration instead of editing 0_init: changing
-- an applied migration makes `migrate dev` demand a reset of existing development databases.
CREATE EXTENSION IF NOT EXISTS postgis;
