import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Users, MapPin, Hotel, BarChart3, Plus, Pencil, Trash2, Shield, ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
type Place = { id: string; name: string; city: string; country: string; category: string; rating: number; description: string | null; image_url: string | null };
type HotelRow = { id: string; name: string; city: string; country: string; price_per_night: number; rating: number; description: string | null; image_url: string | null; amenities: string[] };
type Profile = { id: string; user_id: string; display_name: string | null; avatar_url: string | null; created_at: string };
type UserRole = { id: string; user_id: string; role: AppRole };

const tabs = ["Overview", "Places", "Hotels", "Users"];

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const [places, setPlaces] = useState<Place[]>([]);
  const [hotels, setHotels] = useState<HotelRow[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [counts, setCounts] = useState({ places: 0, hotels: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  // Place form
  const [placeDialog, setPlaceDialog] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [placeForm, setPlaceForm] = useState({ name: "", city: "", country: "", category: "attraction", description: "", image_url: "" });

  // Hotel form
  const [hotelDialog, setHotelDialog] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelRow | null>(null);
  const [hotelForm, setHotelForm] = useState({ name: "", city: "", country: "", price_per_night: "", description: "", image_url: "", amenities: "" });

  // Role form
  const [roleDialog, setRoleDialog] = useState(false);
  const [roleUserId, setRoleUserId] = useState("");
  const [roleValue, setRoleValue] = useState<AppRole>("user");

  const fetchData = async () => {
    setLoading(true);
    const [pRes, hRes, uRes] = await Promise.all([
      supabase.from("tourist_places").select("*").order("created_at", { ascending: false }),
      supabase.from("hotels").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    if (pRes.data) setPlaces(pRes.data as Place[]);
    if (hRes.data) setHotels(hRes.data as HotelRow[]);
    if (uRes.data) setProfiles(uRes.data as Profile[]);
    setCounts({
      places: pRes.data?.length ?? 0,
      hotels: hRes.data?.length ?? 0,
      users: uRes.data?.length ?? 0,
    });

    const rolesRes = await supabase.from("user_roles").select("*");
    if (rolesRes.data) {
      setUserRoles(rolesRes.data as UserRole[]);
      setIsAdmin(rolesRes.data.some((r) => r.user_id === user?.id && r.role === "admin"));
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  // Check if current user is the primary admin (HEMACHANDRAN)
  const isPrimaryAdmin = () => {
    if (!user) return false;
    const profile = profiles.find(p => p.user_id === user.id);
    const name = profile?.display_name?.toLowerCase() ?? "";
    return name.includes("hemachandran") || (isAdmin && userRoles.filter(r => r.role === "admin").length <= 1);
  };

  // PLACES CRUD
  const openPlaceForm = (place?: Place) => {
    if (place) {
      setEditingPlace(place);
      setPlaceForm({ name: place.name, city: place.city, country: place.country, category: place.category, description: place.description ?? "", image_url: place.image_url ?? "" });
    } else {
      setEditingPlace(null);
      setPlaceForm({ name: "", city: "", country: "", category: "attraction", description: "", image_url: "" });
    }
    setPlaceDialog(true);
  };

  const savePlace = async () => {
    if (!placeForm.name || !placeForm.city || !placeForm.country) {
      toast({ title: "Missing fields", description: "Name, city, and country are required", variant: "destructive" });
      return;
    }
    const payload = { ...placeForm, image_url: placeForm.image_url || null, description: placeForm.description || null };
    if (editingPlace) {
      const { error } = await supabase.from("tourist_places").update(payload).eq("id", editingPlace.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Place updated" });
    } else {
      const { error } = await supabase.from("tourist_places").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Place added" });
    }
    setPlaceDialog(false);
    fetchData();
  };

  const deletePlace = async (id: string) => {
    const { error } = await supabase.from("tourist_places").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Place deleted" });
    fetchData();
  };

  // HOTELS CRUD
  const openHotelForm = (hotel?: HotelRow) => {
    if (hotel) {
      setEditingHotel(hotel);
      setHotelForm({ name: hotel.name, city: hotel.city, country: hotel.country, price_per_night: String(hotel.price_per_night), description: hotel.description ?? "", image_url: hotel.image_url ?? "", amenities: hotel.amenities?.join(", ") ?? "" });
    } else {
      setEditingHotel(null);
      setHotelForm({ name: "", city: "", country: "", price_per_night: "", description: "", image_url: "", amenities: "" });
    }
    setHotelDialog(true);
  };

  const saveHotel = async () => {
    if (!hotelForm.name || !hotelForm.city || !hotelForm.country) {
      toast({ title: "Missing fields", description: "Name, city, and country are required", variant: "destructive" });
      return;
    }
    const payload = {
      name: hotelForm.name,
      city: hotelForm.city,
      country: hotelForm.country,
      price_per_night: parseFloat(hotelForm.price_per_night) || 0,
      description: hotelForm.description || null,
      image_url: hotelForm.image_url || null,
      amenities: hotelForm.amenities ? hotelForm.amenities.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    if (editingHotel) {
      const { error } = await supabase.from("hotels").update(payload).eq("id", editingHotel.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Hotel updated" });
    } else {
      const { error } = await supabase.from("hotels").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Hotel added" });
    }
    setHotelDialog(false);
    fetchData();
  };

  const deleteHotel = async (id: string) => {
    const { error } = await supabase.from("hotels").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Hotel deleted" });
    fetchData();
  };

  // ROLES
  const getUserRole = (userId: string): AppRole | null => {
    const role = userRoles.find((r) => r.user_id === userId);
    return role?.role ?? null;
  };

  const assignRole = async () => {
    if (!roleUserId) return;
    const existing = userRoles.find((r) => r.user_id === roleUserId);
    if (existing) {
      const { error } = await supabase.from("user_roles").update({ role: roleValue }).eq("id", existing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Role updated" });
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: roleUserId, role: roleValue });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Role assigned" });
    }
    setRoleDialog(false);
    fetchData();
  };

  const removeRole = async (userId: string) => {
    const existing = userRoles.find((r) => r.user_id === userId);
    if (!existing) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", existing.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Role removed" });
    fetchData();
  };

  const openRoleDialog = (userId: string) => {
    setRoleUserId(userId);
    const existing = getUserRole(userId);
    setRoleValue(existing ?? "user");
    setRoleDialog(true);
  };

  const roleBadge = (role: AppRole | null) => {
    if (!role) return <Badge variant="outline" className="text-muted-foreground">No role</Badge>;
    const colors: Record<AppRole, string> = {
      admin: "bg-destructive/10 text-destructive border-destructive/20",
      moderator: "bg-primary/10 text-primary border-primary/20",
      user: "bg-muted text-muted-foreground border-border",
    };
    return <Badge variant="outline" className={`capitalize ${colors[role]}`}>{role}</Badge>;
  };

  const getProfileAvatar = (userId: string) => {
    const profile = profiles.find(p => p.user_id === userId);
    const name = profile?.display_name || "U";
    const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    return (
      <Avatar className="w-8 h-8">
        <AvatarImage src={profile?.avatar_url ?? undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
      </Avatar>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <ShieldX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = [
    { label: "Total Users", value: String(counts.users), icon: Users, change: "live" },
    { label: "Tourist Places", value: String(counts.places), icon: MapPin, change: "live" },
    { label: "Hotels Listed", value: String(counts.hotels), icon: Hotel, change: "live" },
  ];

  return (
    <Layout>
      <div className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your travel platform.</p>
            </div>
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
              <ShieldCheck className="w-3 h-3" /> Admin
            </Badge>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-accent">● {s.change}</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-card-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-muted rounded-xl p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            {activeTab === "Overview" && (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-card-foreground mb-2">Dashboard Overview</h3>
                <p className="text-muted-foreground">You have {counts.places} places, {counts.hotels} hotels, and {counts.users} users.</p>
              </div>
            )}

            {activeTab === "Places" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display text-lg font-semibold text-card-foreground">Tourist Places</h3>
                  <Button onClick={() => openPlaceForm()} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4" /> Add Place
                  </Button>
                </div>
                {places.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No places yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {places.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.city}</TableCell>
                          <TableCell>{p.country}</TableCell>
                          <TableCell className="capitalize">{p.category}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => openPlaceForm(p)}><Pencil className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deletePlace(p.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-3 h-3" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}

            {activeTab === "Hotels" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display text-lg font-semibold text-card-foreground">Hotels</h3>
                  <Button onClick={() => openHotelForm()} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4" /> Add Hotel
                  </Button>
                </div>
                {hotels.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No hotels yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Price/Night</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hotels.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell className="font-medium">{h.name}</TableCell>
                          <TableCell>{h.city}</TableCell>
                          <TableCell>₹{h.price_per_night}</TableCell>
                          <TableCell>{h.rating}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => openHotelForm(h)}><Pencil className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteHotel(h.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-3 h-3" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}

            {activeTab === "Users" && (
              <div>
                <h3 className="font-display text-lg font-semibold text-card-foreground mb-4">Registered Users</h3>
                {profiles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No registered users yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        {isPrimaryAdmin() && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((u) => {
                        const role = getUserRole(u.user_id);
                        return (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {getProfileAvatar(u.user_id)}
                                <span className="font-medium">{u.display_name || "—"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono">{u.user_id.slice(0, 8)}…</TableCell>
                            <TableCell>{roleBadge(role)}</TableCell>
                            <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                            {isPrimaryAdmin() && (
                              <TableCell className="text-right space-x-1">
                                <Button variant="ghost" size="sm" onClick={() => openRoleDialog(u.user_id)} className="gap-1">
                                  <Shield className="w-3 h-3" /> Set Role
                                </Button>
                                {role && (
                                  <Button variant="ghost" size="sm" onClick={() => removeRole(u.user_id)} className="text-destructive hover:text-destructive gap-1">
                                    <ShieldX className="w-3 h-3" /> Remove
                                  </Button>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Place Dialog */}
      <Dialog open={placeDialog} onOpenChange={setPlaceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlace ? "Edit Place" : "Add Place"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={placeForm.name} onChange={(e) => setPlaceForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>City</Label><Input value={placeForm.city} onChange={(e) => setPlaceForm(f => ({ ...f, city: e.target.value }))} /></div>
              <div><Label>Country</Label><Input value={placeForm.country} onChange={(e) => setPlaceForm(f => ({ ...f, country: e.target.value }))} /></div>
            </div>
            <div><Label>Category</Label><Input value={placeForm.category} onChange={(e) => setPlaceForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. attraction, beach, temple" /></div>
            <div><Label>Description</Label><Input value={placeForm.description} onChange={(e) => setPlaceForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Image URL</Label><Input value={placeForm.image_url} onChange={(e) => setPlaceForm(f => ({ ...f, image_url: e.target.value }))} /></div>
            <Button onClick={savePlace} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {editingPlace ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hotel Dialog */}
      <Dialog open={hotelDialog} onOpenChange={setHotelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingHotel ? "Edit Hotel" : "Add Hotel"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={hotelForm.name} onChange={(e) => setHotelForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>City</Label><Input value={hotelForm.city} onChange={(e) => setHotelForm(f => ({ ...f, city: e.target.value }))} /></div>
              <div><Label>Country</Label><Input value={hotelForm.country} onChange={(e) => setHotelForm(f => ({ ...f, country: e.target.value }))} /></div>
            </div>
            <div><Label>Price per Night (₹)</Label><Input type="number" value={hotelForm.price_per_night} onChange={(e) => setHotelForm(f => ({ ...f, price_per_night: e.target.value }))} /></div>
            <div><Label>Description</Label><Input value={hotelForm.description} onChange={(e) => setHotelForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Amenities (comma-separated)</Label><Input value={hotelForm.amenities} onChange={(e) => setHotelForm(f => ({ ...f, amenities: e.target.value }))} placeholder="WiFi, Pool, Spa" /></div>
            <div><Label>Image URL</Label><Input value={hotelForm.image_url} onChange={(e) => setHotelForm(f => ({ ...f, image_url: e.target.value }))} /></div>
            <Button onClick={saveHotel} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {editingHotel ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={roleDialog} onOpenChange={setRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              User: <span className="font-mono text-foreground">{roleUserId.slice(0, 8)}…</span>
            </p>
            <div>
              <Label>Role</Label>
              <Select value={roleValue} onValueChange={(v) => setRoleValue(v as AppRole)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={assignRole} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Assign Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminPage;
