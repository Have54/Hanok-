import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Terminal, Layers, Download } from 'lucide-react';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<string>('MainActivity');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const files: Record<string, { filename: string; path: string; code: string; language: string }> = {
    MainActivity: {
      filename: 'MainActivity.kt',
      path: 'app/src/main/java/com/timerplus/app/MainActivity.kt',
      language: 'kotlin',
      code: `package com.timerplus.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.*
import com.timerplus.app.ui.theme.TimerPlusTheme
import com.timerplus.app.ui.screens.*
import com.timerplus.app.viewmodel.TimerViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TimerPlusTheme {
                val navController = rememberNavController()
                val viewModel: TimerViewModel = viewModel()

                Scaffold(
                    bottomBar = {
                        BottomNavigationBar(navController = navController, viewModel = viewModel)
                    }
                ) { paddingValues ->
                    NavHost(
                        navController = navController,
                        startDestination = "timer",
                        modifier = Modifier.padding(paddingValues)
                    ) {
                        composable("timer") {
                            TimerScreen(viewModel = viewModel)
                        }
                        composable("stopwatch") {
                            StopwatchScreen(viewModel = viewModel)
                        }
                        composable("settings") {
                            SettingsScreen(viewModel = viewModel)
                        }
                    }
                }
            }
        }
    }
}`,
    },
    TimerViewModel: {
      filename: 'TimerViewModel.kt',
      path: 'app/src/main/java/com/timerplus/app/viewmodel/TimerViewModel.kt',
      language: 'kotlin',
      code: `package com.timerplus.app.viewmodel

import android.app.Application
import android.content.Intent
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.timerplus.app.service.TimerForegroundService
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

data class TimerItem(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val totalDurationMs: Long,
    val remainingMs: Long,
    val isRunning: Boolean = false,
    val isCompleted: Boolean = false
)

data class LapItem(
    val lapIndex: Int,
    val splitTimeMs: Long,
    val overallTimeMs: Long
)

class TimerViewModel(application: Application) : AndroidViewModel(application) {
    private val _timers = MutableStateFlow<List<TimerItem>>(emptyList())
    val timers = _timers.asStateFlow()

    private val _activeTimerId = MutableStateFlow<String?>(null)
    val activeTimerId = _activeTimerId.asStateFlow()

    // Stopwatch state
    private val _stopwatchMs = MutableStateFlow(0L)
    val stopwatchMs = _stopwatchMs.asStateFlow()
    private val _isStopwatchRunning = MutableStateFlow(false)
    val isStopwatchRunning = _isStopwatchRunning.asStateFlow()
    private val _laps = MutableStateFlow<List<LapItem>>(emptyList())
    val laps = _laps.asStateFlow()

    private var timerJob: Job? = null
    private var stopwatchJob: Job? = null

    init {
        startTickerLoop()
    }

    fun createAndStartTimer(durationMs: Long, name: String) {
        val newTimer = TimerItem(
            name = name,
            totalDurationMs = durationMs,
            remainingMs = durationMs,
            isRunning = true
        )
        _timers.value = _timers.value + newTimer
        _activeTimerId.value = newTimer.id
        startForegroundService()
    }

    fun pauseResumeTimer(id: String) {
        _timers.value = _timers.value.map {
            if (it.id == id) it.copy(isRunning = !it.isRunning) else it
        }
    }

    fun addSeconds(id: String, seconds: Long) {
        _timers.value = _timers.value.map {
            if (it.id == id) {
                val newRemaining = it.remainingMs + (seconds * 1000)
                it.copy(
                    remainingMs = newRemaining,
                    totalDurationMs = maxOf(it.totalDurationMs, newRemaining),
                    isCompleted = false
                )
            } else it
        }
    }

    fun resetTimer(id: String) {
        _timers.value = _timers.value.map {
            if (it.id == id) it.copy(remainingMs = it.totalDurationMs, isRunning = false, isCompleted = false) else it
        }
    }

    fun deleteTimer(id: String) {
        _timers.value = _timers.value.filter { it.id != id }
        if (_activeTimerId.value == id) {
            _activeTimerId.value = _timers.value.firstOrNull()?.id
        }
    }

    private fun startTickerLoop() {
        viewModelScope.launch(Dispatchers.Default) {
            while (isActive) {
                delay(100)
                _timers.value = _timers.value.map { timer ->
                    if (timer.isRunning && timer.remainingMs > 0) {
                        val next = timer.remainingMs - 100
                        if (next <= 0) {
                            timer.copy(remainingMs = 0, isRunning = false, isCompleted = true)
                        } else {
                            timer.copy(remainingMs = next)
                        }
                    } else timer
                }
            }
        }
    }

    private fun startForegroundService() {
        val context = getApplication<Application>()
        val intent = Intent(context, TimerForegroundService::class.java)
        context.startForegroundService(intent)
    }
}`,
    },
    TimerScreen: {
      filename: 'TimerScreen.kt',
      path: 'app/src/main/java/com/timerplus/app/ui/screens/TimerScreen.kt',
      language: 'kotlin',
      code: `package com.timerplus.app.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.timerplus.app.viewmodel.TimerViewModel

val BrandOrange = Color(0xFFFF6B00)
val LightBlueBg = Color(0xFFF0F6FD)

@Composable
fun TimerScreen(viewModel: TimerViewModel) {
    val timers by viewModel.timers.collectAsState()
    val activeId by viewModel.activeTimerId.collectAsState()
    val currentTimer = timers.find { it.id == activeId }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightBlueBg)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (currentTimer == null) {
            // Quick Start Screen with Presets & Number Pickers
            Text(
                text = "Timer Plus",
                fontSize = 26.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF0F172A)
            )
            Spacer(modifier = Modifier.height(16.dp))
            PresetRow(onSelect = { ms -> viewModel.createAndStartTimer(ms, "Timer") })
            Spacer(modifier = Modifier.weight(1f))
            Button(
                onClick = { viewModel.createAndStartTimer(600_000L, "10 Min Timer") },
                colors = ButtonDefaults.buttonColors(containerColor = BrandOrange),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Icon(Icons.Default.PlayArrow, contentDescription = "Start")
                Spacer(modifier = Modifier.width(8.dp))
                Text("Start Countdown", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
        } else {
            // Active Circular Timer Screen
            Text(
                text = currentTimer.name,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A)
            )
            Spacer(modifier = Modifier.height(24.dp))
            CircularTimerDial(
                progress = if (currentTimer.totalDurationMs > 0)
                    currentTimer.remainingMs.toFloat() / currentTimer.totalDurationMs
                else 0f,
                remainingMs = currentTimer.remainingMs
            )
            Spacer(modifier = Modifier.height(16.dp))
            // +10s / +30s buttons
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { viewModel.addSeconds(currentTimer.id, 10) }) { Text("+10s") }
                Button(onClick = { viewModel.addSeconds(currentTimer.id, 30) }) { Text("+30s") }
            }
            Spacer(modifier = Modifier.weight(1f))
            // Stop & Pause/Resume
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = { viewModel.resetTimer(currentTimer.id) },
                    modifier = Modifier.weight(1f).height(56.dp),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Text("Reset", color = BrandOrange, fontWeight = FontWeight.Bold)
                }
                Button(
                    onClick = { viewModel.pauseResumeTimer(currentTimer.id) },
                    modifier = Modifier.weight(1f).height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = BrandOrange)
                ) {
                    Text(if (currentTimer.isRunning) "Pause" else "Resume", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun CircularTimerDial(progress: Float, remainingMs: Long) {
    Box(contentAlignment = Alignment.Center, modifier = Modifier.size(280.dp)) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawCircle(
                color = Color(0xFFE2EEFC),
                radius = size.minDimension / 2 - 16.dp.toPx(),
                style = Stroke(width = 14.dp.toPx())
            )
            drawArc(
                color = BrandOrange,
                startAngle = -90f,
                sweepAngle = 360f * progress,
                useCenter = false,
                style = Stroke(width = 14.dp.toPx(), cap = StrokeCap.Round)
            )
        }
        val totalSec = (remainingMs / 1000).toInt()
        val min = totalSec / 60
        val sec = totalSec % 60
        Text(
            text = String.format("%02d:%02d", min, sec),
            fontSize = 48.sp,
            fontWeight = FontWeight.Black,
            color = Color(0xFF0F172A)
        )
    }
}

@Composable
fun PresetRow(onSelect: (Long) -> Unit) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf(5 to "5 Min", 10 to "10 Min", 15 to "15 Min", 30 to "30 Min").forEach { (min, label) ->
            OutlinedButton(
                onClick = { onSelect(min * 60 * 1000L) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(label, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}`,
    },
    TimerForegroundService: {
      filename: 'TimerForegroundService.kt',
      path: 'app/src/main/java/com/timerplus/app/service/TimerForegroundService.kt',
      language: 'kotlin',
      code: `package com.timerplus.app.service

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.timerplus.app.MainActivity

class TimerForegroundService : Service() {
    companion object {
        const val CHANNEL_ID = "timer_plus_running_channel"
        const val NOTIFICATION_ID = 1001
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Timer Plus")
            .setContentText("Countdown timer running in background")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(NOTIFICATION_ID, notification)
        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Active Timers",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps active timers running reliably in background"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`,
    },
    AndroidManifest: {
      filename: 'AndroidManifest.xml',
      path: 'app/src/main/AndroidManifest.xml',
      language: 'xml',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.timerplus.app">

    <!-- Essential Android Permissions for Multi-Timer & Haptics -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Timer Plus"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.TimerPlus">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize"
            android:theme="@style/Theme.TimerPlus">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".service.TimerForegroundService"
            android:foregroundServiceType="specialUse"
            android:exported="false" />
    </application>
</manifest>`,
    },
    BuildInstructions: {
      filename: 'Build_and_APK_Guide.md',
      path: 'docs/Build_and_APK_Guide.md',
      language: 'markdown',
      code: `# Multi Timer – Timer Plus Android Build & APK Generation Guide

### 1. Prerequisites
- Android Studio Ladybug / Iguana or later
- Android SDK 34+
- JDK 17 or JDK 21

### 2. Generate Debug APK (Quick Testing)
Run the following Gradle command in your project root:
\`\`\`bash
./gradlew assembleDebug
\`\`\`
The resulting APK will be generated at:
\`\`\`
app/build/outputs/apk/debug/app-debug.apk
\`\`\`
Install directly onto any connected Android phone or emulator:
\`\`\`bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
\`\`\`

### 3. Generate Release Signed APK (Production Ready)
1. In Android Studio, go to **Build > Generate Signed Bundle / APK...**
2. Select **APK** and click **Next**.
3. Create or select your keystore (.jks) file.
4. Select destination folder and choose build variant: **release**.
5. Alternatively via CLI:
\`\`\`bash
./gradlew assembleRelease
\`\`\`
Output path:
\`\`\`
app/build/outputs/apk/release/app-release-unsigned.apk
\`\`\`
(Sign with \`apksigner\` or configure \`signingConfigs\` in \`build.gradle.kts\`).
`,
    },
  };

  const currentFileData = files[activeFile] || files['MainActivity'];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFileData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const combined = Object.entries(files)
      .map(([key, f]) => `// ==========================================\n// FILE: ${f.path}\n// ==========================================\n\n${f.code}\n\n`)
      .join('\n');
    const blob = new Blob([combined], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TimerPlus_Android_JetpackCompose_Source.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[85vh] max-h-[780px] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                Native Android Studio Project & APK Guide
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Kotlin, Jetpack Compose, Material 3, Foreground Service & APK build instructions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadAll}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All Files</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* File Tabs Strip */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar">
          {Object.entries(files).map(([key, f]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFile(key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeFile === key
                  ? 'bg-orange-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{f.filename}</span>
            </button>
          ))}
        </div>

        {/* File Path & Copy Toolbar */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="truncate">{currentFileData.path}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-bold cursor-pointer transition-colors shrink-0 ml-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy File'}</span>
          </button>
        </div>

        {/* Code Content Viewport */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed no-scrollbar select-text">
          <pre>{currentFileData.code}</pre>
        </div>
      </div>
    </div>
  );
};
