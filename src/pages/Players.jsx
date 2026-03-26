import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const classifications = ["1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5"];

export default function Players() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", number: "", classification: "1.0", status: "bench" });
  const queryClient = useQueryClient();

  const { data: players = [] } = useQuery({
    queryKey: ["players"],
    queryFn: () => api.entities.Player.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.Player.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["players"] }); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Player.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["players"] }); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Player.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["players"] }),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }) => api.entities.Player.update(id, { status: status === "active" ? "bench" : "active" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["players"] }),
  });

  const resetForm = () => {
    setForm({ name: "", number: "", classification: "1.0", status: "bench" });
    setEditing(null);
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, number: parseFloat(form.number), classification: parseFloat(form.classification) };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (player) => {
    setEditing(player);
    setForm({ name: player.name, number: String(player.number), classification: String(player.classification), status: player.status });
    setOpen(true);
  };

  const activePlayers = players.filter(p => p.status === "active");
  const benchPlayers = players.filter(p => p.status === "bench");

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">Roster</h1>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold">
              <Plus className="w-4 h-4 mr-2" /> Add Player
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Player" : "Add Player"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="bg-secondary border-border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Number</Label>
                  <Input type="number" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} required className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Classification</Label>
                  <Select value={form.classification} onValueChange={v => setForm({ ...form, classification: v })}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {classifications.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="bench">Bench</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground rounded-xl font-bold">
                {editing ? "Update" : "Add"} Player
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <PlayerSection title="Active" count={activePlayers.length} players={activePlayers} onEdit={handleEdit} onDelete={(id) => deleteMutation.mutate(id)} onToggle={(p) => toggleStatus.mutate({ id: p.id, status: p.status })} />
      <PlayerSection title="Bench" count={benchPlayers.length} players={benchPlayers} onEdit={handleEdit} onDelete={(id) => deleteMutation.mutate(id)} onToggle={(p) => toggleStatus.mutate({ id: p.id, status: p.status })} />
    
    </div>
  );
}

function PlayerSection({ title, count, players, onEdit, onDelete, onToggle }) {
  const navigate = useNavigate();
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">{title} ({count})</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {players.map(p => (
          <div
            key={p.id}
            className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => navigate(`/PlayerDetail?id=${p.id}`)}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-black text-primary">#{p.number}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">Class {p.classification}</p>
            </div>
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <button onClick={() => onToggle(p)} className="p-2 rounded-lg hover:bg-secondary transition-colors" title={p.status === "active" ? "Move to bench" : "Set active"}>
                {p.status === "active" ? <UserCheck className="w-4 h-4 text-emerald-400" /> : <UserX className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button onClick={() => onEdit(p)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => onDelete(p.id)} className="p-2 rounded-lg hover:bg-destructive/20 transition-colors">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
        {players.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-2 py-4 text-center">No players</p>
        )}
      </div>
    </div>
  );
}