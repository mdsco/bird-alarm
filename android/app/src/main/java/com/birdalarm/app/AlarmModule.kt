package com.birdalarm.app

import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.Calendar

class AlarmModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "BirdAlarm"

    companion object {
        const val REQUEST_CODE = 1001
        const val REQUEST_CODE_SNOOZE = 1002
        private const val PREFS_NAME = "BirdAlarmPrefs"

        /**
         * Schedule the AlarmManager alarm for the given hour:minute.
         * Pass reschedule=true from AlarmReceiver so it always lands on the next calendar day.
         */
        fun scheduleAlarmAt(context: Context, hour: Int, minute: Int, reschedule: Boolean) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            val calendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
                if (reschedule || timeInMillis <= System.currentTimeMillis()) {
                    add(Calendar.DAY_OF_MONTH, 1)
                }
            }

            val alarmIntent = Intent(context, AlarmReceiver::class.java).apply {
                putExtra(AlarmReceiver.EXTRA_HOUR, hour)
                putExtra(AlarmReceiver.EXTRA_MINUTE, minute)
            }

            val pendingIntent = PendingIntent.getBroadcast(
                context,
                REQUEST_CODE,
                alarmIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setAlarmClock(
                        AlarmManager.AlarmClockInfo(calendar.timeInMillis, pendingIntent),
                        pendingIntent,
                    )
                }
            } else {
                alarmManager.setAlarmClock(
                    AlarmManager.AlarmClockInfo(calendar.timeInMillis, pendingIntent),
                    pendingIntent,
                )
            }
        }
    }

    /**
     * Schedule the daily alarm and persist the settings for reboot recovery.
     */
    @ReactMethod
    fun scheduleAlarm(hour: Int, minute: Int, promise: Promise) {
        try {
            reactApplicationContext
                .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putInt("alarmHour", hour)
                .putInt("alarmMinute", minute)
                .putBoolean("alarmEnabled", true)
                .apply()

            scheduleAlarmAt(reactApplicationContext, hour, minute, reschedule = false)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SCHEDULE_ERROR", e.message, e)
        }
    }

    /**
     * Cancel the scheduled alarm and clear the persisted enabled flag.
     */
    @ReactMethod
    fun cancelAlarm(promise: Promise) {
        try {
            reactApplicationContext
                .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit().putBoolean("alarmEnabled", false).apply()

            val alarmManager =
                reactApplicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(reactApplicationContext, AlarmReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                reactApplicationContext,
                REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("CANCEL_ERROR", e.message, e)
        }
    }

    /**
     * Schedule a one-shot snooze alarm delayMs in the future. Uses a separate
     * PendingIntent slot so the daily alarm remains untouched. The receiver
     * skips its self-reschedule branch because no hour/minute extras are passed.
     */
    @ReactMethod
    fun scheduleSnooze(delayMs: Double, promise: Promise) {
        try {
            val alarmManager =
                reactApplicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val triggerAt = System.currentTimeMillis() + delayMs.toLong()

            val alarmIntent = Intent(reactApplicationContext, AlarmReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                reactApplicationContext,
                REQUEST_CODE_SNOOZE,
                alarmIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setAlarmClock(
                        AlarmManager.AlarmClockInfo(triggerAt, pendingIntent),
                        pendingIntent,
                    )
                }
            } else {
                alarmManager.setAlarmClock(
                    AlarmManager.AlarmClockInfo(triggerAt, pendingIntent),
                    pendingIntent,
                )
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SNOOZE_ERROR", e.message, e)
        }
    }

    /**
     * Cancel any pending snooze without affecting the daily alarm.
     */
    @ReactMethod
    fun cancelSnooze(promise: Promise) {
        try {
            val alarmManager =
                reactApplicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(reactApplicationContext, AlarmReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                reactApplicationContext,
                REQUEST_CODE_SNOOZE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("CANCEL_ERROR", e.message, e)
        }
    }

    /**
     * Returns true (and clears the flag) if the alarm has fired since the last check.
     * Called by JS on mount and on AppState→active to detect missed alarm triggers.
     */
    @ReactMethod
    fun checkAlarmFired(promise: Promise) {
        val prefs = reactApplicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val fired = prefs.getBoolean("alarmFiredPending", false)
        if (fired) prefs.edit().putBoolean("alarmFiredPending", false).apply()
        promise.resolve(fired)
    }

    /**
     * On Android 14+, USE_FULL_SCREEN_INTENT requires explicit user grant.
     * Returns false if the grant is missing so the UI can direct users to Settings.
     */
    @ReactMethod
    fun canUseFullScreenIntent(promise: Promise) {
        try {
            val result = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                val nm = reactApplicationContext
                    .getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                nm.canUseFullScreenIntent()
            } else {
                true
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
}
