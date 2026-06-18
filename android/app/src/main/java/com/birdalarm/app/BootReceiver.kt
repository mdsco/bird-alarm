package com.birdalarm.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Reschedules the daily alarm after the device reboots.
 * AlarmManager alarms do not survive a reboot, so we persist the alarm settings
 * in SharedPreferences and restore them here.
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED &&
            intent.action != "android.intent.action.QUICKBOOT_POWERON"
        ) return

        val prefs = context.getSharedPreferences("BirdAlarmPrefs", Context.MODE_PRIVATE)
        val hour = prefs.getInt("alarmHour", -1)
        val minute = prefs.getInt("alarmMinute", -1)
        val enabled = prefs.getBoolean("alarmEnabled", false)

        if (enabled && hour >= 0 && minute >= 0) {
            AlarmModule.scheduleAlarmAt(context, hour, minute, reschedule = false)
        }
    }
}
