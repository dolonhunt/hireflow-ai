"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface RealtimeUpdate {
  type: "candidate" | "job" | "pipeline" | "task" | "outreach";
  action: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  timestamp: string;
}

type UpdateHandler = (update: RealtimeUpdate) => void;

const subscribers = new Set<UpdateHandler>();

export function subscribeToRealtime(handler: UpdateHandler) {
  subscribers.add(handler);
  
  return () => {
    subscribers.delete(handler);
  };
}

function notifySubscribers(update: RealtimeUpdate) {
  subscribers.forEach((handler) => {
    try {
      handler(update);
    } catch (error) {
      console.error("Error in realtime handler:", error);
    }
  });
}

let channels: RealtimeChannel[] = [];

export function initializeRealtime() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("Supabase not configured, skipping realtime init");
    return () => {};
  }

  const candidatesChannel = supabase
    .channel("candidates-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "candidates" },
      (payload) => {
        notifySubscribers({
          type: "candidate",
          action: payload.eventType as "insert" | "update" | "delete",
          payload: payload.new || payload.old || {},
          timestamp: new Date().toISOString(),
        });
      }
    )
    .subscribe();

  const jobsChannel = supabase
    .channel("jobs-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "jobs" },
      (payload) => {
        notifySubscribers({
          type: "job",
          action: payload.eventType as "insert" | "update" | "delete",
          payload: payload.new || payload.old || {},
          timestamp: new Date().toISOString(),
        });
      }
    )
    .subscribe();

  const pipelineChannel = supabase
    .channel("pipeline-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "pipeline_entries" },
      (payload) => {
        notifySubscribers({
          type: "pipeline",
          action: payload.eventType as "insert" | "update" | "delete",
          payload: payload.new || payload.old || {},
          timestamp: new Date().toISOString(),
        });
      }
    )
    .subscribe();

  const tasksChannel = supabase
    .channel("tasks-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks" },
      (payload) => {
        notifySubscribers({
          type: "task",
          action: payload.eventType as "insert" | "update" | "delete",
          payload: payload.new || payload.old || {},
          timestamp: new Date().toISOString(),
        });
      }
    )
    .subscribe();

  channels = [candidatesChannel, jobsChannel, pipelineChannel, tasksChannel];

  return () => {
    channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    channels = [];
  };
}

export function useRealtimeUpdates() {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);

  const handleUpdate = useCallback((update: RealtimeUpdate) => {
    setUpdates((prev) => [update, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToRealtime(handleUpdate);
    return unsubscribe;
  }, [handleUpdate]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return { updates, clearUpdates };
}

export function RealtimeStatus() {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      return;
    }

    const channel = supabase.channel("health-check");

    channel.on("presence", { event: "sync" }, () => {
      setConnected(true);
      setLastUpdate(new Date());
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.track({ online: true });
      }
    });

    const interval = setInterval(() => {
      channel.track({ online: true, timestamp: Date.now() });
    }, 30000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="flex items-center gap-2 text-xs text-text-soft">
        <span className="h-2 w-2 rounded-full bg-gray-400" />
        <span>Realtime disabled (no Supabase)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-text-soft">
      <span className={`h-2 w-2 rounded-full ${connected ? "bg-success" : "bg-warning"}`} />
      <span>{connected ? "Live" : "Connecting..."}</span>
      {lastUpdate && <span>· Last sync: {lastUpdate.toLocaleTimeString()}</span>}
    </div>
  );
}