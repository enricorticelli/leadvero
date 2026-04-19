"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, KeyRound, ShieldCheck, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Select, Field } from "@/components/ui/Input";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { useConfirm } from "@/components/ui/ConfirmProvider";

interface User {
  id: string;
  username: string;
  role: "admin" | "user";
  mustChangePassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export function UsersClient({ currentUserId }: { currentUserId: string }) {
  const confirm = useConfirm();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [cUsername, setCUsername] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cRole, setCRole] = useState<"admin" | "user">("user");
  const [cError, setCError] = useState<string | null>(null);
  const [cLoading, setCLoading] = useState(false);

  const [pwTarget, setPwTarget] = useState<User | null>(null);
  const [pwValue, setPwValue] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = (await res.json()) as { users: User[] };
      setUsers(data.users);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createUser() {
    setCError(null);
    setCLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cUsername,
        password: cPassword,
        role: cRole,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setCError(data.error ?? "Errore imprevisto");
      setCLoading(false);
      return;
    }
    setCLoading(false);
    setCreateOpen(false);
    setCUsername("");
    setCPassword("");
    setCRole("user");
    load();
  }

  async function toggleRole(user: User) {
    const nextRole = user.role === "admin" ? "user" : "admin";
    const ok = await confirm({
      title: `${nextRole === "admin" ? "Promuovere" : "Declassare"} ${user.username}?`,
      message:
        nextRole === "admin"
          ? "Diventerà amministratore con pieno controllo."
          : "Perderà i permessi di amministrazione.",
      confirmLabel: "Conferma",
    });
    if (!ok) return;
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      alert(data.error ?? "Errore");
      return;
    }
    load();
  }

  async function deleteUser(user: User) {
    const ok = await confirm({
      title: `Eliminare ${user.username}?`,
      message: "L'utente perderà immediatamente l'accesso.",
      confirmLabel: "Elimina",
      tone: "danger",
    });
    if (!ok) return;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      alert(data.error ?? "Errore");
      return;
    }
    load();
  }

  async function resetPassword() {
    if (!pwTarget) return;
    setPwError(null);
    setPwLoading(true);
    const res = await fetch(`/api/users/${pwTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwValue }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setPwError(data.error ?? "Errore imprevisto");
      setPwLoading(false);
      return;
    }
    setPwLoading(false);
    setPwTarget(null);
    setPwValue("");
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-ink-500">Amministrazione</p>
          <h2 className="text-2xl font-bold text-ink-900">Utenti</h2>
        </div>
        <Button
          onClick={() => {
            setCUsername("");
            setCPassword("");
            setCRole("user");
            setCError(null);
            setCreateOpen(true);
          }}
          iconLeft={<Plus className="h-4 w-4" />}
        >
          Nuovo utente
        </Button>
      </div>

      <Card padding="sm">
        <Table>
          <THead>
            <tr>
              <TH>Username</TH>
              <TH>Ruolo</TH>
              <TH>Stato</TH>
              <TH>Ultimo accesso</TH>
              <TH />
            </tr>
          </THead>
          <TBody>
            {loading && (
              <TR>
                <TD colSpan={5} className="py-8 text-center text-ink-400">
                  Caricamento…
                </TD>
              </TR>
            )}
            {!loading && users.length === 0 && (
              <TR>
                <TD colSpan={5} className="py-8 text-center text-ink-400">
                  Nessun utente.
                </TD>
              </TR>
            )}
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <TR key={u.id}>
                  <TD>
                    <span className="font-semibold text-ink-900">
                      {u.username}
                    </span>
                    {isSelf && (
                      <span className="ml-2 text-xs text-ink-400">(tu)</span>
                    )}
                  </TD>
                  <TD>
                    <Badge tone={u.role === "admin" ? "brand" : "neutral"}>
                      {u.role === "admin" ? "Admin" : "Utente"}
                    </Badge>
                  </TD>
                  <TD>
                    {u.mustChangePassword ? (
                      <Badge tone="yellow">Password da cambiare</Badge>
                    ) : (
                      <span className="text-xs text-ink-400">—</span>
                    )}
                  </TD>
                  <TD className="text-xs text-ink-500">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleString("it-IT")
                      : "mai"}
                  </TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPwTarget(u);
                          setPwValue("");
                          setPwError(null);
                        }}
                        aria-label="Reset password"
                        title="Reset password"
                        className="rounded-lg p-1.5 text-ink-400 hover:bg-surface-muted hover:text-ink-900"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleRole(u)}
                        disabled={isSelf && u.role === "admin"}
                        aria-label="Cambia ruolo"
                        title={
                          u.role === "admin" ? "Rimuovi admin" : "Rendi admin"
                        }
                        className="rounded-lg p-1.5 text-ink-400 hover:bg-surface-muted hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {u.role === "admin" ? (
                          <Shield className="h-4 w-4" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(u)}
                        disabled={isSelf}
                        aria-label="Elimina"
                        className="rounded-lg p-1.5 text-ink-400 hover:bg-tile-pink-bg hover:text-tile-pink-icon disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => (cLoading ? null : setCreateOpen(false))}
        title="Nuovo utente"
        description="L'utente dovrà cambiare la password al primo accesso."
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              disabled={cLoading}
            >
              Annulla
            </Button>
            <Button
              onClick={createUser}
              disabled={cLoading || !cUsername || !cPassword}
            >
              {cLoading ? "Creazione…" : "Crea utente"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Username">
            <Input
              value={cUsername}
              onChange={(e) => setCUsername(e.target.value)}
              placeholder="es. mario.rossi"
              disabled={cLoading}
            />
          </Field>
          <Field label="Password provvisoria" hint="Almeno 6 caratteri.">
            <Input
              type="password"
              value={cPassword}
              onChange={(e) => setCPassword(e.target.value)}
              disabled={cLoading}
            />
          </Field>
          <Field label="Ruolo">
            <Select
              value={cRole}
              onChange={(e) => setCRole(e.target.value as "admin" | "user")}
              disabled={cLoading}
            >
              <option value="user">Utente</option>
              <option value="admin">Amministratore</option>
            </Select>
          </Field>
          {cError && (
            <div className="rounded-lg bg-tile-pink-bg px-3 py-2 text-sm text-tile-pink-icon">
              {cError}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={pwTarget !== null}
        onClose={() => (pwLoading ? null : setPwTarget(null))}
        title={pwTarget ? `Reset password — ${pwTarget.username}` : ""}
        description="L'utente dovrà cambiarla al prossimo accesso."
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setPwTarget(null)}
              disabled={pwLoading}
            >
              Annulla
            </Button>
            <Button onClick={resetPassword} disabled={pwLoading || !pwValue}>
              {pwLoading ? "Salvataggio…" : "Reset"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nuova password provvisoria" hint="Almeno 6 caratteri.">
            <Input
              type="password"
              value={pwValue}
              onChange={(e) => setPwValue(e.target.value)}
              disabled={pwLoading}
            />
          </Field>
          {pwError && (
            <div className="rounded-lg bg-tile-pink-bg px-3 py-2 text-sm text-tile-pink-icon">
              {pwError}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
