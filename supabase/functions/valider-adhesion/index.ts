// supabase/functions/valider-adhesion/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Edge Function — Valide une demande d'adhésion :
//   1. Lit la demande dans `adhesions`
//   2. Crée le compte Supabase Auth (email + mdp_tmp)
//   3. Insère dans `organisateurs`
//   4. Passe statut → 'validee', efface mdp_tmp
//
// Déploiement :
//   supabase functions deploy valider-adhesion
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { adhesion_id } = await req.json();
    if (!adhesion_id) throw new Error("adhesion_id manquant");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Récupère la demande
    const { data: dem, error: e1 } = await admin
      .from("adhesions").select("*").eq("id", adhesion_id).single();
    if (e1 || !dem) throw new Error("Demande introuvable");
    if (dem.statut !== "en_attente") throw new Error("Demande déjà traitée");

    // 2. Crée le compte Auth
    const { data: auth, error: e2 } = await admin.auth.admin.createUser({
      email:          dem.email,
      password:       dem.mdp_tmp,
      email_confirm:  true,
      user_metadata:  { prenom: dem.prenom, nom: dem.nom, association: dem.association, role: "organisateur" },
    });
    if (e2) throw new Error("Auth: " + e2.message);

    // 3. Insère dans organisateurs
    const { error: e3 } = await admin.from("organisateurs").insert({
      auth_user_id: auth.user.id,
      prenom:       dem.prenom,
      nom:          dem.nom,
      association:  dem.association,
      email:        dem.email,
    });
    if (e3) throw new Error("Organisateur: " + e3.message);

    // 4. Met à jour la demande
    const { error: e4 } = await admin.from("adhesions")
      .update({ statut: "validee", mdp_tmp: "", updated_at: new Date().toISOString() })
      .eq("id", adhesion_id);
    if (e4) throw new Error("Update adhesion: " + e4.message);

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
