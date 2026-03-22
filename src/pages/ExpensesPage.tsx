import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Plus, IndianRupee, Utensils, Hotel, Bus, Camera, ShoppingBag, Trash2, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const categoryIcons: Record<string, typeof IndianRupee> = {
  Food: Utensils,
  Accommodation: Hotel,
  Transport: Bus,
  Activities: Camera,
  Shopping: ShoppingBag,
  Other: IndianRupee,
};

const categoryColors: Record<string, string> = {
  Food: "bg-primary/10 text-primary",
  Accommodation: "bg-accent/10 text-accent",
  Transport: "bg-secondary text-secondary-foreground",
  Activities: "bg-primary/10 text-primary",
  Shopping: "bg-accent/10 text-accent",
  Other: "bg-muted text-muted-foreground",
};

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

const ExpensesPage = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [budget, setBudget] = useState(1000);
  const [editBudgetOpen, setEditBudgetOpen] = useState(false);
  const [newBudget, setNewBudget] = useState("");

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const fetchExpenses = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setExpenses(data.map((e: any) => ({ id: e.id, title: e.title, amount: Number(e.amount), category: e.category, date: e.date })));

    const { data: budgetData } = await supabase
      .from("user_budgets")
      .select("budget")
      .eq("user_id", user.id)
      .maybeSingle();
    if (budgetData) setBudget(Number(budgetData.budget));
    setLoading(false);
  };

  useEffect(() => { fetchExpenses(); }, [user]);

  const addExpense = async () => {
    if (!title || !amount || !user) return;
    const { error } = await supabase.from("expenses").insert({
      user_id: user.id,
      title,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString().split("T")[0],
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setTitle("");
    setAmount("");
    setShowForm(false);
    fetchExpenses();
  };

  const removeExpense = async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    fetchExpenses();
  };

  const saveBudget = async () => {
    if (!user || !newBudget) return;
    const val = parseFloat(newBudget);
    if (isNaN(val) || val <= 0) return;

    const { data: existing } = await supabase.from("user_budgets").select("id").eq("user_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("user_budgets").update({ budget: val }).eq("user_id", user.id);
    } else {
      await supabase.from("user_budgets").insert({ user_id: user.id, budget: val });
    }
    setBudget(val);
    setEditBudgetOpen(false);
    toast({ title: "Budget updated" });
  };

  const categoryTotals = Object.keys(categoryIcons).map((cat) => ({
    category: cat,
    total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">Expense Tracker</h1>
              <p className="text-muted-foreground mt-1">Track your trip spending and stay within budget.</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </motion.div>

          {/* Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-2xl p-6 shadow-card cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => { setNewBudget(String(budget)); setEditBudgetOpen(true); }}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground mb-1">Budget</p>
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="font-display text-3xl font-bold text-foreground">₹{budget}</p>
              <p className="text-xs text-muted-foreground mt-1">Click to edit</p>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <p className="text-sm text-muted-foreground mb-1">Spent</p>
              <p className="font-display text-3xl font-bold text-primary">₹{totalSpent}</p>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <p className="text-sm text-muted-foreground mb-1">Remaining</p>
              <p className={`font-display text-3xl font-bold ${budget - totalSpent >= 0 ? "text-accent" : "text-destructive"}`}>
                ₹{budget - totalSpent}
              </p>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((totalSpent / budget) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {categoryTotals.length > 0 && (
            <div className="bg-card rounded-2xl p-6 shadow-card mb-8">
              <h3 className="font-display text-lg font-semibold text-card-foreground mb-4">Category Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {categoryTotals.map((ct) => {
                  const Icon = categoryIcons[ct.category];
                  return (
                    <div key={ct.category} className="text-center p-3 rounded-xl bg-muted/50">
                      <div className={`w-10 h-10 rounded-lg ${categoryColors[ct.category]} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-muted-foreground">{ct.category}</p>
                      <p className="font-semibold text-foreground">₹{ct.total}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Form */}
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card rounded-2xl p-6 shadow-card mb-8">
              <h3 className="font-display text-lg font-semibold text-card-foreground mb-4">New Expense</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Expense title" className="bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 text-foreground font-body" />
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (₹)" className="bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 text-foreground font-body" />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-3 outline-none text-foreground font-body">
                  {Object.keys(categoryIcons).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Button onClick={addExpense} className="bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
            </motion.div>
          )}

          {/* Expense List */}
          <div className="space-y-3">
            {expenses.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No expenses yet. Add your first expense!</div>
            )}
            {expenses.map((exp) => {
              const Icon = categoryIcons[exp.category] || IndianRupee;
              return (
                <motion.div key={exp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-card">
                  <div className={`w-10 h-10 rounded-lg ${categoryColors[exp.category] || "bg-muted text-muted-foreground"} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">{exp.title}</p>
                    <p className="text-xs text-muted-foreground">{exp.category} • {exp.date}</p>
                  </div>
                  <p className="font-semibold text-foreground">₹{exp.amount}</p>
                  <button onClick={() => removeExpense(exp.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Budget Dialog */}
      <Dialog open={editBudgetOpen} onOpenChange={setEditBudgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Budget Amount (₹)</Label>
              <Input type="number" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} placeholder="1000" />
            </div>
            <Button onClick={saveBudget} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Save Budget</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ExpensesPage;
