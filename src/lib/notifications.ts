import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

export interface Notification {
  id: string;
  userId: string;
  type: "candidate_match" | "task_reminder" | "pipeline_update" | "import_complete" | "daily_digest";
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export async function createNotification(
  userId: string,
  type: Notification["type"],
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<Notification | null> {
  if (!supabaseUrl || !supabaseKey) {
    console.log("Supabase not configured, skipping notification");
    return null;
  }

  const notification: Omit<Notification, "id"> = {
    userId,
    type,
    title,
    message,
    read: false,
    data,
    createdAt: new Date().toISOString(),
  };

  const { data: created, error } = await supabase
    .from("notifications")
    .insert(notification)
    .select()
    .single();

  if (error) {
    console.error("Error creating notification:", error);
    return null;
  }

  return created;
}

export async function getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return data || [];
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  if (!supabaseUrl || !supabaseKey) {
    return false;
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking notification read:", error);
    return false;
  }

  return true;
}

export async function sendEmailNotification(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  
  if (!resendKey) {
    console.log("Resend API key not configured, skipping email");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "HireFlow AI <noreply@resend.dev>",
        to,
        subject,
        html: body,
      }),
    });

    if (!response.ok) {
      console.error("Error sending email:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function sendDailyDigest(userEmail: string, stats: {
  newCandidates: number;
  tasksDue: number;
  pipelineChanges: number;
}): Promise<boolean> {
  const subject = "HireFlow AI - Daily Summary";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0f5f64;">HireFlow AI - Daily Summary</h1>
      <p>Here's your daily recruitment summary:</p>
      <ul>
        <li><strong>New Candidates:</strong> ${stats.newCandidates}</li>
        <li><strong>Tasks Due:</strong> ${stats.tasksDue}</li>
        <li><strong>Pipeline Changes:</strong> ${stats.pipelineChanges}</li>
      </ul>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="color: #0f5f64;">View Dashboard</a></p>
    </div>
  `;

  return sendEmailNotification(userEmail, subject, html);
}

export async function sendTaskReminder(
  userEmail: string,
  taskTitle: string,
  candidateName: string,
  dueDate: string
): Promise<boolean> {
  const subject = `Task Reminder: ${taskTitle}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0f5f64;">Task Reminder</h1>
      <p>You have an upcoming task:</p>
      <ul>
        <li><strong>Task:</strong> ${taskTitle}</li>
        <li><strong>Candidate:</strong> ${candidateName}</li>
        <li><strong>Due:</strong> ${dueDate}</li>
      </ul>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/workflow" style="color: #0f5f64;">View Tasks</a></p>
    </div>
  `;

  return sendEmailNotification(userEmail, subject, html);
}