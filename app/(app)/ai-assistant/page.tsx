"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send, Sparkles, Loader2, User, Bot, Trash2, Download,
  Copy, Check, Settings, MessageSquare, BarChart3, Package,
  TrendingUp, AlertTriangle, Mic, Paperclip, Zap, Database, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/store";
import { getProducts, getParties, getDashboardMetrics, getInvoices } from "@/lib/store";
import type { Product, Party, Invoice } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    type?: "text" | "data" | "chart" | "action";
    data?: Array<{ label: string; value: string }>;
    suggestions?: string[];
  };
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const QUICK_ACTIONS = [
  { label: "Check Low Stock", icon: AlertTriangle, prompt: "Show me all products with low stock" },
  { label: "Today's Sales", icon: TrendingUp, prompt: "What are today's sales figures?" },
  { label: "Top Products", icon: Package, prompt: "Which products are selling the most?" },
  { label: "Generate Report", icon: BarChart3, prompt: "Generate a sales report for this month" },
];

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "default",
      title: "New Conversation",
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I'm your Quantura AI Assistant, specialized in business management. I have access to your complete inventory data, sales records, purchase history, and customer information.\n\nI can help you with:\n• Inventory analysis and stock management\n• Sales trends and forecasting\n• Purchase order recommendations\n• Customer insights and receivables\n• Report generation and data visualization\n• GST calculations and compliance\n• Business insights and recommendations\n\nHow can I assist you today?",
          timestamp: new Date(),
          metadata: {
            type: "text",
            suggestions: [
              "Show me products running low on stock",
              "What were my sales yesterday?",
              "Which customers owe me money?",
              "Suggest products to reorder",
            ],
          },
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [currentConversationId, setCurrentConversationId] = useState("default");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: products } = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const { data: parties } = useQuery({ queryKey: ["parties"], queryFn: () => getParties() });
  const { data: invoices } = useQuery({ queryKey: ["invoices"], queryFn: () => getInvoices() });

  const currentConversation = conversations.find((c) => c.id === currentConversationId)!;
  const messages = currentConversation.messages;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const updateConversation = (id: string, newMessages: Message[]) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id
          ? { ...conv, messages: newMessages, updatedAt: new Date(),
              title: newMessages.length > 1 && conv.title === "New Conversation"
                ? newMessages[1].content.slice(0, 50) + "..." : conv.title }
          : conv
      )
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input.trim(), timestamp: new Date() };
    updateConversation(currentConversationId, [...messages, userMessage]);
    setInput("");
    setIsLoading(true);
    setTimeout(() => {
      const response = generateIntelligentResponse(userMessage.content, products || [], parties || [], invoices || []);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response.content, timestamp: new Date(), metadata: response.metadata };
      updateConversation(currentConversationId, [...messages, userMessage, aiMessage]);
      setIsLoading(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(), title: "New Conversation",
      messages: [{ id: "welcome-" + Date.now(), role: "assistant", content: "Hello! How can I help you today?", timestamp: new Date() }],
      createdAt: new Date(), updatedAt: new Date(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
  };

  const deleteConversation = (id: string) => {
    if (conversations.length === 1) return;
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(conversations[0].id === id ? conversations[1].id : conversations[0].id);
    }
  };

  const clearCurrentConversation = () => {
    updateConversation(currentConversationId, [{ id: "cleared-" + Date.now(), role: "assistant", content: "Conversation cleared. How can I help you?", timestamp: new Date() }]);
  };

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportConversation = () => {
    const text = messages.map((m) => `[${m.role.toUpperCase()}] ${m.timestamp.toLocaleString()}\n${m.content}\n`).join("\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="flex h-screen" style={{ background: "#050508" }}>
      {/* Sidebar */}
      <aside className="w-64 flex flex-col" style={{ background: "#0a0a0f", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={createNewConversation}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-black transition-all hover:brightness-110"
            style={{ background: "#00c8ff", boxShadow: "0 0 20px rgba(0,200,255,0.3)" }}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-all"
                style={{
                  background: currentConversationId === conv.id ? "rgba(0,200,255,0.1)" : "transparent",
                  color: currentConversationId === conv.id ? "#00c8ff" : "#9ca3af",
                  borderLeft: currentConversationId === conv.id ? "2px solid #00c8ff" : "2px solid transparent",
                }}
                onClick={() => setCurrentConversationId(conv.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{conv.title}</span>
                {conversations.length > 1 && (
                  <button
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded hover:text-white transition-all"
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm transition-all"
            style={{ color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(15,15,20,0.8)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #00c8ff, #a855f7)", boxShadow: "0 0 20px rgba(0,200,255,0.3)" }}>
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">AI Assistant</h1>
              <p className="text-xs" style={{ color: "#9ca3af" }}>Powered by advanced inventory intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Online badge — cyan, matching screenshot */}
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium" style={{ background: "rgba(0,200,255,0.15)", color: "#00c8ff", border: "1px solid rgba(0,200,255,0.3)" }}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#00c8ff" }} />
              Online
            </span>
            <button onClick={exportConversation} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all" style={{ color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button onClick={clearCurrentConversation} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all" style={{ color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    className="flex items-center gap-3 rounded-xl p-4 text-left transition-all hover:border-[#00c8ff]/40"
                    style={{ background: "#0f0f14", border: "1px solid rgba(255,255,255,0.08)" }}
                    onClick={() => { setInput(action.prompt); setTimeout(() => handleSend(), 100); }}
                  >
                    <div className="rounded-lg p-2" style={{ background: "rgba(0,200,255,0.1)" }}>
                      <action.icon className="h-4 w-4" style={{ color: "#00c8ff" }} />
                    </div>
                    <p className="text-sm font-medium text-white">{action.label}</p>
                  </button>
                ))}
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} onCopy={copyMessage} copiedId={copiedId} onSuggestionClick={setInput} />
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #00c8ff, #a855f7)" }}>
                  <Bot className="h-5 w-5 text-black" />
                </div>
                <div className="rounded-xl p-4" style={{ background: "#0f0f14", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#00c8ff" }} />
                    <span className="text-sm" style={{ color: "#9ca3af" }}>Analyzing your data...</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {["#00c8ff", "#a855f7", "#00c8ff"].map((c, i) => (
                      <div key={i} className="h-2 w-2 rounded-full animate-bounce" style={{ background: c, animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="shrink-0 px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(15,15,20,0.8)" }}>
          <div className="mx-auto max-w-4xl">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything about your inventory, sales, purchases, or customers..."
                  className="min-h-[52px] max-h-[200px] resize-none rounded-xl px-4 py-3 pr-24 text-sm text-white placeholder:text-[#4b5563]"
                  style={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.1)" }}
                  disabled={isLoading}
                  rows={1}
                />
                <div className="absolute right-2 bottom-2 flex gap-1">
                  <button className="h-8 w-8 flex items-center justify-center rounded opacity-40" disabled>
                    <Paperclip className="h-4 w-4" style={{ color: "#9ca3af" }} />
                  </button>
                  <button className="h-8 w-8 flex items-center justify-center rounded opacity-40" disabled>
                    <Mic className="h-4 w-4" style={{ color: "#9ca3af" }} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-[52px] w-[52px] shrink-0 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                style={{ background: "#00c8ff", boxShadow: "0 0 20px rgba(0,200,255,0.3)", color: "#000" }}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs" style={{ color: "#4b5563" }}>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Database className="h-3 w-3" /> Connected to live inventory data</span>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Real-time insights</span>
              </div>
              <span>AI can make mistakes. Verify important information.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, onCopy, copiedId, onSuggestionClick }: {
  message: Message;
  onCopy: (content: string, id: string) => void;
  copiedId: string | null;
  onSuggestionClick: (suggestion: string) => void;
}) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="rounded-full px-3 py-1 text-xs" style={{ background: "rgba(255,255,255,0.06)", color: "#9ca3af" }}>
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: isUser
            ? "linear-gradient(135deg, #a855f7, #00c8ff)"
            : "linear-gradient(135deg, #00c8ff, #a855f7)",
          boxShadow: "0 0 12px rgba(0,200,255,0.2)",
        }}
      >
        {isUser ? <User className="h-5 w-5 text-black" /> : <Bot className="h-5 w-5 text-black" />}
      </div>

      <div className={cn("flex max-w-[85%] flex-col gap-2", isUser && "items-end")}>
        {/* Bubble */}
        <div
          className="relative group rounded-xl px-4 py-3"
          style={
            isUser
              ? { background: "rgba(0,200,255,0.12)", border: "1px solid rgba(0,200,255,0.25)" }
              : { background: "#0f0f14", border: "1px solid rgba(255,255,255,0.08)" }
          }
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-white">
            {message.content}
          </div>

          {/* Data rows */}
          {!isUser && message.metadata?.data && (
            <div className="mt-4 pt-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {message.metadata.data.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <span className="font-medium text-white">{item.label}</span>
                  <span style={{ color: "#9ca3af" }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Suggestion pills — cyan outlined, matching screenshot */}
          {!isUser && message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {message.metadata.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="rounded-lg px-3 py-1 text-xs transition-all hover:bg-[rgba(0,200,255,0.2)]"
                  style={{ border: "1px solid rgba(0,200,255,0.4)", color: "#00c8ff" }}
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Copy button */}
          <div className={cn("absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1", isUser && "right-auto left-0")}>
            <button
              className="h-7 w-7 rounded-lg flex items-center justify-center transition-all"
              style={{ background: "#161620", border: "1px solid rgba(255,255,255,0.1)" }}
              onClick={() => onCopy(message.content, message.id)}
            >
              {copiedId === message.id
                ? <Check className="h-3 w-3" style={{ color: "#00c8ff" }} />
                : <Copy className="h-3 w-3" style={{ color: "#9ca3af" }} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-1">
          <span className="text-xs" style={{ color: "#4b5563" }}>
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {!isUser && message.metadata?.type && (
            <span className="rounded px-1.5 py-0.5 text-[10px]" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#4b5563" }}>
              {message.metadata.type}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function generateIntelligentResponse(
  userInput: string,
  products: Product[],
  parties: Party[],
  invoices: Invoice[]
): { content: string; metadata?: { type?: "text" | "data" | "chart" | "action"; data?: Array<{ label: string; value: string }>; suggestions?: string[] } } {
  const input = userInput.toLowerCase();

  if (input.includes("low stock") || input.includes("running low") || input.includes("reorder")) {
    const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);
    if (lowStockProducts.length === 0) {
      return { content: "Great news! All your products are adequately stocked. No items are currently below their minimum threshold.", metadata: { type: "data" } };
    }
    const criticalItems = lowStockProducts.filter((p) => p.stock === 0);
    const warningItems = lowStockProducts.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
    let response = `I found ${lowStockProducts.length} product(s) that need attention:\n\n`;
    if (criticalItems.length > 0) {
      response += `🔴 CRITICAL - Out of Stock (${criticalItems.length} items):\n`;
      criticalItems.slice(0, 5).forEach((p) => { response += `• ${p.name} - Stock: ${p.stock} (Min: ${p.lowStockThreshold})\n`; });
      response += "\n";
    }
    if (warningItems.length > 0) {
      response += `⚠️ WARNING - Low Stock (${warningItems.length} items):\n`;
      warningItems.slice(0, 5).forEach((p) => { response += `• ${p.name} - Stock: ${p.stock} (Min: ${p.lowStockThreshold})\n`; });
    }
    const totalReorderValue = lowStockProducts.reduce((sum, p) => sum + (p.lowStockThreshold * 2 - p.stock) * p.costPrice, 0);
    response += `\n💰 Estimated reorder cost: ${formatCurrency(totalReorderValue)}\n\nWould you like me to help you create purchase orders for these items?`;
    return {
      content: response,
      metadata: {
        type: "data",
        data: lowStockProducts.slice(0, 10).map((p) => ({ label: p.name, value: `Stock: ${p.stock} / Min: ${p.lowStockThreshold}` })),
        suggestions: ["Create purchase order", "Show supplier details", "View product details"],
      },
    };
  }

  if (input.includes("sales") || input.includes("revenue") || input.includes("sold")) {
    const salesInvoices = invoices.filter((i) => i.type === "sale");
    const today = new Date().toISOString().split("T")[0];
    const todaySales = salesInvoices.filter((i) => i.date.startsWith(today));
    const totalSalesToday = todaySales.reduce((sum, i) => sum + i.grandTotal, 0);
    const totalSalesMonth = salesInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const avgSaleValue = salesInvoices.length > 0 ? totalSalesMonth / salesInvoices.length : 0;
    const paidInvoices = salesInvoices.filter((i) => i.status === "paid").length;
    const unpaidInvoices = salesInvoices.filter((i) => i.status === "unpaid").length;
    const partialInvoices = salesInvoices.filter((i) => i.status === "partial").length;
    return {
      content: `📊 Sales Performance Overview:\n\nToday's Sales: ${formatCurrency(totalSalesToday)}\nTotal Invoices Today: ${todaySales.length}\n\nMonthly Sales: ${formatCurrency(totalSalesMonth)}\nTotal Invoices: ${salesInvoices.length}\nAverage Sale Value: ${formatCurrency(avgSaleValue)}\n\nPayment Status:\n✅ Paid: ${paidInvoices} invoices\n⏳ Partial: ${partialInvoices} invoices\n❌ Unpaid: ${unpaidInvoices} invoices`,
      metadata: { type: "data", suggestions: ["Show top selling products", "View unpaid invoices", "Generate sales report"] },
    };
  }

  if (input.includes("top") && (input.includes("product") || input.includes("selling"))) {
    const salesInvoices = invoices.filter((i) => i.type === "sale");
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    salesInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        if (!productSales[item.productId]) productSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    let response = `🏆 Top 10 Selling Products:\n\n`;
    topProducts.forEach((p, idx) => { response += `${idx + 1}. ${p.name}\n   Qty: ${p.quantity} units | Revenue: ${formatCurrency(p.revenue)}\n\n`; });
    return {
      content: response,
      metadata: {
        type: "data",
        data: topProducts.map((p, idx) => ({ label: `${idx + 1}. ${p.name}`, value: formatCurrency(p.revenue) })),
        suggestions: ["Show product details", "Check stock levels", "View sales trend"],
      },
    };
  }

  if (input.includes("customer") || input.includes("party") || input.includes("receivable") || input.includes("owe")) {
    const customers = parties.filter((p) => p.type === "customer");
    const customersWithBalance = customers.filter((c) => c.balance > 0);
    const totalReceivables = customersWithBalance.reduce((sum, c) => sum + c.balance, 0);
    let response = `👥 Customer Overview:\n\nTotal Customers: ${customers.length}\nWith Outstanding Balance: ${customersWithBalance.length}\nTotal Receivables: ${formatCurrency(totalReceivables)}\n\n`;
    if (customersWithBalance.length > 0) {
      response += `Top Outstanding Balances:\n`;
      customersWithBalance.sort((a, b) => b.balance - a.balance).slice(0, 5).forEach((c) => { response += `• ${c.name}: ${formatCurrency(c.balance)}\n  Phone: ${c.phone}\n`; });
    }
    return {
      content: response,
      metadata: {
        type: "data",
        data: customersWithBalance.slice(0, 10).map((c) => ({ label: c.name, value: formatCurrency(c.balance) })),
        suggestions: ["Send payment reminders", "View customer details", "Generate receivables report"],
      },
    };
  }

  if (input.includes("supplier") || input.includes("payable")) {
    const suppliers = parties.filter((p) => p.type === "supplier");
    const suppliersWithBalance = suppliers.filter((s) => s.balance < 0);
    const totalPayables = suppliersWithBalance.reduce((sum, s) => sum + Math.abs(s.balance), 0);
    let response = `🏭 Supplier Overview:\n\nTotal Suppliers: ${suppliers.length}\nWith Outstanding Payables: ${suppliersWithBalance.length}\nTotal Payables: ${formatCurrency(totalPayables)}\n\n`;
    if (suppliersWithBalance.length > 0) {
      response += `Top Outstanding Payables:\n`;
      suppliersWithBalance.sort((a, b) => a.balance - b.balance).slice(0, 5).forEach((s) => { response += `• ${s.name}: ${formatCurrency(Math.abs(s.balance))}\n  Phone: ${s.phone}\n`; });
    }
    return {
      content: response,
      metadata: {
        type: "data",
        data: suppliersWithBalance.slice(0, 10).map((s) => ({ label: s.name, value: formatCurrency(Math.abs(s.balance)) })),
        suggestions: ["Schedule payments", "View supplier details", "Generate payables report"],
      },
    };
  }

  if (input.includes("inventory") || input.includes("stock") || input.includes("products")) {
    const totalStockValue = products.reduce((sum, p) => sum + p.stock * p.sellingPrice, 0);
    const totalCostValue = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
    const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    return {
      content: `📦 Inventory Overview:\n\nTotal Products: ${products.length}\nStock Value (Selling): ${formatCurrency(totalStockValue)}\nStock Value (Cost): ${formatCurrency(totalCostValue)}\nPotential Profit: ${formatCurrency(totalStockValue - totalCostValue)}\n\n⚠️ Low Stock: ${lowStock} items\n🔴 Out of Stock: ${outOfStock} items`,
      metadata: {
        type: "data",
        data: [
          { label: "Total Products", value: String(products.length) },
          { label: "Stock Value", value: formatCurrency(totalStockValue) },
          { label: "Low Stock Items", value: String(lowStock) },
          { label: "Out of Stock", value: String(outOfStock) },
        ],
        suggestions: ["Show low stock items", "View top products", "Check categories"],
      },
    };
  }

  return {
    content: `I understand you're asking about "${userInput}". I can help you with inventory analysis, sales data, customer insights, supplier information, and business reports.\n\nWhat specific information would you like to explore?`,
    metadata: {
      type: "text",
      suggestions: ["Show inventory overview", "Check sales performance", "View customer balances", "Low stock alert"],
    },
  };
}
