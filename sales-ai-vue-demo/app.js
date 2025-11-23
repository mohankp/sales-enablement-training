// ConversationAI Vue.js 3 Application

// ===== DATA MODELS =====
const dataModels = {
  callSession: {
    id: "call_2025_001",
    salesRep: "John Davis",
    prospect: "Sarah Chen", 
    company: "TechCorp Solutions",
    startTime: "2025-09-27T12:14:00Z",
    duration: "00:23:45",
    status: "active",
    type: "discovery"
  },
  transcript: [
    {
      id: 1,
      speaker: "John",
      text: "Hi Sarah, thanks for taking the time to speak with me today about your CRM needs.",
      timestamp: "00:01:15",
      sentiment: 0.7,
      type: "rep",
      keywords: ["CRM"],
      fillerWords: 0
    },
    {
      id: 2,
      speaker: "Sarah", 
      text: "Of course John. We've been struggling with our current Salesforce setup and looking for alternatives.",
      timestamp: "00:01:22",
      sentiment: 0.1,
      type: "prospect",
      keywords: ["Salesforce", "alternatives"],
      fillerWords: 0
    },
    {
      id: 3,
      speaker: "John",
      text: "I completely understand those challenges. Many of our clients, um, have come from Salesforce actually.",
      timestamp: "00:01:35", 
      sentiment: 0.6,
      type: "rep",
      keywords: ["Salesforce", "clients"],
      fillerWords: 1
    },
    {
      id: 4,
      speaker: "Sarah",
      text: "What makes your solution different? We're also evaluating HubSpot and Pipedrive.",
      timestamp: "00:01:48",
      sentiment: 0.2,
      type: "prospect",
      keywords: ["HubSpot", "Pipedrive", "evaluating"],
      fillerWords: 0
    },
    {
      id: 5,
      speaker: "John",
      text: "Great question. Unlike HubSpot or Pipedrive, our platform offers advanced AI-powered conversation intelligence.",
      timestamp: "00:02:05",
      sentiment: 0.8,
      type: "rep", 
      keywords: ["HubSpot", "Pipedrive", "AI", "conversation intelligence"],
      fillerWords: 0
    },
    {
      id: 6,
      speaker: "Sarah",
      text: "That sounds interesting, but honestly, we're concerned about the cost. Budget is tight this quarter.",
      timestamp: "00:02:18",
      sentiment: -0.3,
      type: "prospect",
      keywords: ["cost", "budget"],
      fillerWords: 0
    },
    {
      id: 7,
      speaker: "John",
      text: "I totally get that concern about budget. What if I could show you how our ROI calculator demonstrates 3x return in the first year?",
      timestamp: "00:02:35",
      sentiment: 0.7,
      type: "rep",
      keywords: ["budget", "ROI", "return"],
      fillerWords: 0
    },
    {
      id: 8,
      speaker: "Sarah",
      text: "Now you have my attention. Show me those numbers.",
      timestamp: "00:02:42",
      sentiment: 0.6,
      type: "prospect",
      keywords: ["attention", "numbers"],
      fillerWords: 0
    }
  ],
  metrics: {
    sentiment: {
      overall: 0.65,
      current: 0.6,
      trend: "positive",
      history: [0.7, 0.1, 0.6, 0.2, 0.8, -0.3, 0.7, 0.6]
    },
    talkListenRatio: {
      rep: 58,
      prospect: 42,
      target: 43,
      status: "needs_improvement"
    },
    speakingPace: {
      current: 152,
      average: 148,
      target: 150,
      status: "good"
    },
    fillerWords: {
      count: 1,
      rate: 0.5,
      target: 2,
      status: "excellent"
    },
    engagement: {
      score: 78,
      questions: 3,
      interruptions: 1
    }
  },
  analytics: {
    smartTrackers: {
      budget: 85,
      champion: 45,
      competition: 95,
      pain: 78,
      decision: 62,
      timeline: 35,
      authority: 55,
      nextSteps: 80
    },
    keywordTriggers: [
      {
        keyword: "Salesforce",
        count: 2,
        sentiment: 0.1,
        context: "competitor"
      },
      {
        keyword: "budget",
        count: 2,
        sentiment: -0.1,
        context: "objection"
      },
      {
        keyword: "ROI", 
        count: 1,
        sentiment: 0.7,
        context: "value"
      }
    ],
    objections: [
      {
        type: "cost",
        timestamp: "00:02:18",
        severity: "medium",
        handled: true
      }
    ],
    buyingSignals: [
      {
        signal: "Show me those numbers",
        timestamp: "00:02:42",
        strength: "high",
        type: "engagement"
      }
    ]
  },
  coaching: {
    insights: [
      "Reduce filler words - detected 1 instance",
      "Excellent objection handling on budget concerns", 
      "Consider asking more discovery questions",
      "Strong competitive positioning"
    ],
    recommendations: [
      {
        type: "speech",
        priority: "medium",
        suggestion: "Reduce pace slightly for better comprehension"
      },
      {
        type: "discovery",
        priority: "high",
        suggestion: "Ask about decision timeline and process"
      }
    ],
    scorecard: {
      overall: 87,
      discovery: 78,
      presentation: 92,
      objectionHandling: 95,
      closing: 72
    }
  },
  team: [
    {
      id: 1,
      name: "John Davis",
      status: "on_call",
      callDuration: "23:45",
      sentiment: 0.65,
      performance: 87,
      talkRatio: 58
    },
    {
      id: 2,
      name: "Lisa Park",
      status: "available",
      callDuration: "00:00",
      sentiment: 0,
      performance: 92,
      talkRatio: 0
    },
    {
      id: 3,
      name: "Mike Johnson",
      status: "on_call",
      callDuration: "08:12",
      sentiment: 0.45,
      performance: 78,
      talkRatio: 65
    },
    {
      id: 4,
      name: "Anna Smith",
      status: "break",
      callDuration: "00:00",
      sentiment: 0,
      performance: 88,
      talkRatio: 0
    }
  ]
};

// ===== EVENT BUS =====
function createEventBus() {
  const { ref } = Vue;
  const events = ref(new Map());
  
  const emit = (eventName, payload) => {
    if (events.value.has(eventName)) {
      events.value.get(eventName).forEach(callback => callback(payload));
    }
  };
  
  const on = (eventName, callback) => {
    if (!events.value.has(eventName)) {
      events.value.set(eventName, []);
    }
    events.value.get(eventName).push(callback);
  };
  
  const off = (eventName, callback) => {
    if (events.value.has(eventName)) {
      const callbacks = events.value.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  };
  
  return { emit, on, off };
}

// ===== COMPONENTS =====

// Call Controls Component
const CallControls = {
  template: `
    <div>
      <h3>Call Controls</h3>
      <div class="call-info">
        <div class="call-participants">
          <div class="participant">
            <div class="avatar">{{ getInitials(callSession.salesRep) }}</div>
            <div class="info">
              <span class="name">{{ callSession.salesRep }}</span>
              <span class="role">Sales Rep</span>
            </div>
          </div>
          <div class="participant">
            <div class="avatar">{{ getInitials(callSession.prospect) }}</div>
            <div class="info">
              <span class="name">{{ callSession.prospect }}</span>
              <span class="role">{{ callSession.company }}</span>
            </div>
          </div>
        </div>
        <div class="call-timer">
          <span class="timer">{{ formattedDuration }}</span>
        </div>
      </div>
      <div class="control-buttons">
        <button class="btn btn--primary" @click="startSimulation" :disabled="isSimulationRunning">
          {{ isSimulationRunning ? 'Running...' : 'Start Simulation' }}
        </button>
        <button class="btn btn--secondary" @click="pauseSimulation" :disabled="!isSimulationRunning">Pause</button>
        <button class="btn btn--outline" @click="stopSimulation" :disabled="!isSimulationRunning">Stop</button>
      </div>
    </div>
  `,
  setup() {
    const { inject, computed } = Vue;
    const dataModels = inject('dataModels');
    const eventBus = inject('eventBus');
    const simulationState = inject('simulationState');
    
    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };
    
    const formattedDuration = computed(() => {
      return simulationState.isRunning ? simulationState.currentDuration : dataModels.callSession.duration;
    });
    
    const startSimulation = () => {
      eventBus.emit('call-started');
    };
    
    const pauseSimulation = () => {
      eventBus.emit('call-paused');
    };
    
    const stopSimulation = () => {
      eventBus.emit('call-ended');
    };
    
    return {
      callSession: dataModels.callSession,
      getInitials,
      formattedDuration,
      startSimulation,
      pauseSimulation,
      stopSimulation,
      isSimulationRunning: computed(() => simulationState.isRunning)
    };
  }
};

// Live Transcription Component
const LiveTranscription = {
  template: `
    <div>
      <h3>Live Transcription</h3>
      <div class="transcript-container" ref="transcriptContainer">
        <div v-for="entry in displayedTranscript" :key="entry.id" :class="['transcript-message', entry.type]">
          <span class="speaker">{{ entry.speaker }}</span>
          <span class="text">{{ entry.text }}</span>
          <span class="timestamp">{{ entry.timestamp }}</span>
        </div>
      </div>
    </div>
  `,
  setup() {
    const { inject, onMounted, ref, nextTick, watch } = Vue;
    const simulationState = inject('simulationState');
    const transcriptContainer = ref(null);
    
    const scrollToBottom = async () => {
      await nextTick();
      if (transcriptContainer.value) {
        transcriptContainer.value.scrollTop = transcriptContainer.value.scrollHeight;
      }
    };
    
    // Watch for transcript updates and scroll
    watch(() => simulationState.displayedTranscript.length, () => {
      scrollToBottom();
    });
    
    return {
      displayedTranscript: simulationState.displayedTranscript,
      transcriptContainer
    };
  }
};

// Sentiment Analysis Component
const SentimentAnalysis = {
  template: `
    <div>
      <h3>Live Sentiment Analysis</h3>
      <div class="sentiment-display">
        <div class="sentiment-score">
          <span :class="['score', sentimentClass]">{{ formattedSentiment }}</span>
          <span class="label">{{ sentimentLabel }}</span>
        </div>
        <div class="sentiment-chart-container">
          <canvas ref="sentimentChart"></canvas>
        </div>
      </div>
    </div>
  `,
  setup() {
    const { inject, computed, ref, onMounted } = Vue;
    const dataModels = inject('dataModels');
    const simulationState = inject('simulationState');
    const sentimentChart = ref(null);
    let chartInstance = null;
    
    const currentSentiment = computed(() => {
      return simulationState.isRunning ? simulationState.currentSentiment : dataModels.metrics.sentiment.overall;
    });
    
    const sentimentClass = computed(() => {
      const sentiment = currentSentiment.value;
      if (sentiment > 0.3) return 'positive';
      if (sentiment < -0.3) return 'negative';
      return 'neutral';
    });
    
    const sentimentLabel = computed(() => {
      const sentiment = currentSentiment.value;
      if (sentiment > 0.3) return 'Overall Positive';
      if (sentiment < -0.3) return 'Overall Negative';
      return 'Neutral';
    });
    
    const formattedSentiment = computed(() => {
      const sentiment = currentSentiment.value;
      return sentiment > 0 ? `+${sentiment.toFixed(2)}` : sentiment.toFixed(2);
    });
    
    onMounted(() => {
      if (sentimentChart.value) {
        initSentimentChart();
      }
    });
    
    const initSentimentChart = () => {
      const ctx = sentimentChart.value;
      if (!ctx || !window.Chart) return;
      
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Sentiment',
            data: [],
            borderColor: '#1FB8CD',
            backgroundColor: 'rgba(31, 184, 205, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              min: -1,
              max: 1
            }
          }
        }
      });
      
      simulationState.sentimentChartInstance = chartInstance;
    };
    
    return {
      sentimentClass,
      sentimentLabel,
      formattedSentiment,
      sentimentChart
    };
  }
};

// Talk Listen Ratio Component
const TalkListenRatio = {
  template: `
    <div class="metric-card">
      <h4>Talk/Listen Ratio</h4>
      <div class="ratio-gauge">
        <canvas ref="talkListenChart" width="120" height="120"></canvas>
      </div>
      <div class="ratio-labels">
        <span class="rep-ratio">Rep: <span>{{ metrics.talkListenRatio.rep }}%</span></span>
        <span class="prospect-ratio">Prospect: <span>{{ metrics.talkListenRatio.prospect }}%</span></span>
      </div>
    </div>
  `,
  setup() {
    const { inject, ref, onMounted } = Vue;
    const dataModels = inject('dataModels');
    const talkListenChart = ref(null);
    
    onMounted(() => {
      if (talkListenChart.value && window.Chart) {
        initTalkListenChart();
      }
    });
    
    const initTalkListenChart = () => {
      const ctx = talkListenChart.value;
      if (!ctx) return;
      
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Rep', 'Prospect'],
          datasets: [{
            data: [dataModels.metrics.talkListenRatio.rep, dataModels.metrics.talkListenRatio.prospect],
            backgroundColor: ['#1FB8CD', '#FFC185'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            }
          },
          cutout: '70%'
        }
      });
    };
    
    return {
      metrics: dataModels.metrics,
      talkListenChart
    };
  }
};

// Speaking Pace Component
const SpeakingPace = {
  template: `
    <div class="metric-card">
      <h4>Speaking Pace</h4>
      <div class="pace-display">
        <span class="pace-number">{{ metrics.speakingPace.current }}</span>
        <span class="pace-unit">WPM</span>
      </div>
      <div :class="['pace-status', paceStatus]">{{ paceStatusText }}</div>
    </div>
  `,
  setup() {
    const { inject, computed } = Vue;
    const dataModels = inject('dataModels');
    
    const paceStatus = computed(() => {
      return dataModels.metrics.speakingPace.status;
    });
    
    const paceStatusText = computed(() => {
      return paceStatus.value === 'good' ? 'Optimal Range' : 'Needs Improvement';
    });
    
    return {
      metrics: dataModels.metrics,
      paceStatus,
      paceStatusText
    };
  }
};

// Filler Words Component
const FillerWords = {
  template: `
    <div class="metric-card">
      <h4>Filler Words</h4>
      <div class="filler-count">
        <span class="count">{{ metrics.fillerWords.count }}</span>
      </div>
      <div class="filler-types">um, actually</div>
    </div>
  `,
  setup() {
    const { inject } = Vue;
    const dataModels = inject('dataModels');
    
    return {
      metrics: dataModels.metrics
    };
  }
};

// RTA Cards Component
const RTACards = {
  template: `
    <div>
      <h3>Real-Time Assist</h3>
      <div class="rta-cards">
        <div v-for="card in activeCards" :key="card.id" :class="['rta-card', card.type]">
          <div class="card-header">
            <span class="trigger-word">{{ card.trigger }}</span>
            <span class="card-type">{{ card.type }}</span>
          </div>
          <h4>{{ card.title }}</h4>
          <p>{{ card.content }}</p>
        </div>
        <div v-if="activeCards.length === 0" class="rta-card">
          <div class="card-header">
            <span class="trigger-word">Ready</span>
            <span class="card-type">system</span>
          </div>
          <h4>Real-Time Assist Ready</h4>
          <p>Start a call simulation to see battle cards and coaching suggestions appear here automatically.</p>
        </div>
      </div>
    </div>
  `,
  setup() {
    const { inject } = Vue;
    const simulationState = inject('simulationState');
    
    return {
      activeCards: simulationState.activeRTACards
    };
  }
};

// Whisper Controls Component
const WhisperControls = {
  template: `
    <div>
      <h3>Manager Controls</h3>
      <div class="control-actions">
        <button class="btn btn--outline btn--sm">🎧 Silent Monitor</button>
        <button class="btn btn--outline btn--sm">💬 Whisper Coach</button>
        <button class="btn btn--secondary btn--sm">📞 Barge In</button>
      </div>
      <div class="keyword-alerts">
        <h4>Keyword Alerts</h4>
        <div v-for="alert in keywordAlerts" :key="alert.id" :class="['alert-item', alert.type]">
          <span class="keyword">{{ alert.keyword }}</span>
          <span class="time">{{ alert.time }}</span>
        </div>
      </div>
    </div>
  `,
  setup() {
    const { ref } = Vue;
    
    const keywordAlerts = ref([
      {
        id: 1,
        keyword: 'HubSpot',
        time: '00:01:48',
        type: 'competitor'
      },
      {
        id: 2,
        keyword: 'budget',
        time: '00:02:18',
        type: 'objection'
      }
    ]);
    
    return {
      keywordAlerts
    };
  }
};

// ===== ROUTE COMPONENTS =====

// Live Call Monitor Component
const LiveCallMonitor = {
  template: `
    <div class="live-monitor-grid">
      <!-- Call Controls -->
      <div class="panel call-controls">
        <call-controls></call-controls>
      </div>

      <!-- Live Transcription -->
      <div class="panel transcription-panel">
        <live-transcription></live-transcription>
      </div>

      <!-- Real-Time Metrics -->
      <div class="panel metrics-panel">
        <h3>Real-Time Metrics</h3>
        <div class="metrics-grid">
          <talk-listen-ratio></talk-listen-ratio>
          <speaking-pace></speaking-pace>
          <filler-words></filler-words>
        </div>
      </div>

      <!-- Sentiment Analysis -->
      <div class="panel sentiment-panel">
        <sentiment-analysis></sentiment-analysis>
      </div>

      <!-- RTA Coaching Panel -->
      <div class="panel rta-panel">
        <r-t-a-cards></r-t-a-cards>
      </div>

      <!-- Manager Controls -->
      <div class="panel manager-controls">
        <whisper-controls></whisper-controls>
      </div>
    </div>
  `
};

// Post Call Analytics Component
const PostCallAnalytics = {
  template: `
    <div class="post-call-grid">
      <div class="panel">
        <call-summary></call-summary>
      </div>

      <div class="panel">
        <smart-trackers></smart-trackers>
      </div>

      <div class="panel full-transcript">
        <h3>Full Transcript</h3>
        <div class="transcript-search">
          <input type="text" v-model="searchTerm" placeholder="Search transcript..." class="form-control">
        </div>
        <div class="transcript-content">
          <div v-for="entry in filteredTranscript" :key="entry.id" :class="['transcript-message', entry.type]">
            <span class="speaker">{{ entry.speaker }}</span>
            <span class="text">{{ entry.text }}</span>
            <span class="timestamp">{{ entry.timestamp }}</span>
          </div>
        </div>
      </div>

      <div class="panel performance-chart">
        <h3>Sentiment Throughout Call</h3>
        <div class="chart-container" style="position: relative; height: 300px;">
          <canvas ref="callSentimentChart"></canvas>
        </div>
      </div>
    </div>
  `,
  setup() {
    const { reactive, computed, inject, onMounted, ref } = Vue;
    const dataModels = inject('dataModels');
    const searchTerm = ref('');
    const callSentimentChart = ref(null);
    
    const filteredTranscript = computed(() => {
      if (!searchTerm.value) return dataModels.transcript;
      return dataModels.transcript.filter(entry => 
        entry.text.toLowerCase().includes(searchTerm.value.toLowerCase())
      );
    });
    
    onMounted(() => {
      if (callSentimentChart.value && window.Chart) {
        initCallSentimentChart();
      }
    });
    
    const initCallSentimentChart = () => {
      const ctx = callSentimentChart.value;
      if (!ctx) return;
      
      const sentimentData = dataModels.metrics.sentiment.history;
      const timeLabels = dataModels.transcript.slice(0, sentimentData.length).map(t => t.timestamp);
      
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: timeLabels,
          datasets: [{
            label: 'Sentiment Score',
            data: sentimentData,
            borderColor: '#1FB8CD',
            backgroundColor: 'rgba(31, 184, 205, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: sentimentData.map(s => s > 0 ? '#1FB8CD' : '#DB4545'),
            pointBorderColor: sentimentData.map(s => s > 0 ? '#1FB8CD' : '#DB4545')
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              min: -1,
              max: 1,
              ticks: {
                callback: function(value) {
                  return value > 0 ? `+${value}` : value;
                }
              }
            }
          }
        }
      });
    };
    
    return {
      searchTerm,
      filteredTranscript,
      callSentimentChart
    };
  }
};

// Additional component definitions
const CallSummary = {
  template: `
    <div>
      <h3>Call Summary</h3>
      <div class="summary-stats">
        <div class="stat">
          <span class="label">Duration</span>
          <span class="value">{{ callSession.duration }}</span>
        </div>
        <div class="stat">
          <span class="label">Overall Score</span>
          <span class="value score-good">{{ coaching.scorecard.overall }}/100</span>
        </div>
        <div class="stat">
          <span class="label">Sentiment</span>
          <span class="value positive">{{ sentimentLabel }}</span>
        </div>
      </div>
      <div class="ai-summary">
        <h4>AI-Generated Summary</h4>
        <p>Strong discovery call with {{ callSession.company }}. Prospect showed clear pain points with current Salesforce setup and demonstrated buying interest when ROI was discussed. Key competitors: HubSpot, Pipedrive. Budget concerns addressed successfully.</p>
      </div>
    </div>
  `,
  setup() {
    const { inject, computed } = Vue;
    const dataModels = inject('dataModels');
    
    const sentimentLabel = computed(() => {
      const sentiment = dataModels.metrics.sentiment.overall;
      if (sentiment > 0.3) return 'Positive';
      if (sentiment < -0.3) return 'Negative';
      return 'Neutral';
    });
    
    return {
      callSession: dataModels.callSession,
      coaching: dataModels.coaching,
      sentimentLabel
    };
  }
};

const SmartTrackers = {
  template: `
    <div>
      <h3>Smart Trackers</h3>
      <div class="trackers-grid">
        <div v-for="(value, key) in analytics.smartTrackers" :key="key" class="tracker">
          <span class="label">{{ formatTrackerLabel(key) }}</span>
          <div class="progress-bar">
            <div class="progress" :style="{ width: value + '%' }"></div>
          </div>
          <span class="value">{{ value }}%</span>
        </div>
      </div>
    </div>
  `,
  setup() {
    const { inject } = Vue;
    const dataModels = inject('dataModels');
    
    const formatTrackerLabel = (key) => {
      return key.charAt(0).toUpperCase() + key.slice(1);
    };
    
    return {
      analytics: dataModels.analytics,
      formatTrackerLabel
    };
  }
};

// ===== ROUTES =====
const routes = [
  {
    path: '/',
    name: 'LiveCallMonitor',
    component: LiveCallMonitor
  },
  {
    path: '/post-call',
    name: 'PostCallAnalytics',
    component: PostCallAnalytics
  },
  {
    path: '/coaching',
    name: 'CoachingTraining',
    component: { 
      template: `
        <div class="coaching-grid">
          <div class="panel">
            <h3>Performance Scorecard</h3>
            <div class="scorecard">
              <div v-for="(score, category) in scorecard" :key="category" class="score-item" v-if="category !== 'overall'">
                <span class="category">{{ formatScoreCategory(category) }}</span>
                <span class="score">{{ score }}/100</span>
              </div>
            </div>
          </div>

          <div class="panel">
            <h3>Coaching Insights</h3>
            <div class="insights-list">
              <div v-for="(insight, index) in insights" :key="index" :class="['insight', getInsightType(insight)]">
                <span class="icon">{{ getInsightIcon(insight) }}</span>
                <p>{{ insight }}</p>
              </div>
            </div>
          </div>

          <div class="panel">
            <h3>Training Recommendations</h3>
            <div class="training-cards">
              <div class="training-card">
                <h4>Competitive Positioning</h4>
                <p>Master battle cards for Salesforce, HubSpot, and Pipedrive</p>
                <button class="btn btn--primary btn--sm">Start Training</button>
              </div>
              <div class="training-card">
                <h4>Budget Objection Handling</h4>
                <p>Practice ROI conversations and value selling techniques</p>
                <button class="btn btn--primary btn--sm">Start Training</button>
              </div>
            </div>
          </div>

          <div class="panel">
            <h3>Virtual Practice Partner</h3>
            <div class="practice-interface">
              <div class="scenario-selector">
                <select class="form-control" v-model="selectedScenario">
                  <option>Budget Objection Scenario</option>
                  <option>Competitive Evaluation</option>
                  <option>Discovery Call</option>
                  <option>Closing Call</option>
                </select>
              </div>
              <button class="btn btn--primary" @click="startPractice">Start Practice Session</button>
            </div>
          </div>
        </div>
      `,
      setup() {
        const { ref, inject } = Vue;
        const dataModels = inject('dataModels');
        const selectedScenario = ref('Budget Objection Scenario');
        
        const startPractice = () => {
          console.log('Starting practice session:', selectedScenario.value);
        };
        
        const formatScoreCategory = (category) => {
          return category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        };
        
        const getInsightType = (insight) => {
          if (insight.includes('Reduce') || insight.includes('Consider')) return 'suggestion';
          if (insight.includes('Excellent')) return 'positive';
          return 'improvement';
        };
        
        const getInsightIcon = (insight) => {
          if (insight.includes('Reduce') || insight.includes('Consider')) return '💡';
          if (insight.includes('Excellent')) return '✅';
          return '⚠️';
        };
        
        return {
          selectedScenario,
          startPractice,
          scorecard: dataModels.coaching.scorecard,
          insights: dataModels.coaching.insights,
          formatScoreCategory,
          getInsightType,
          getInsightIcon
        };
      }
    }
  },
  {
    path: '/manager',
    name: 'ManagerDashboard',
    component: { 
      template: `
        <div class="manager-grid">
          <div class="panel">
            <h3>Live Team Monitoring</h3>
            <div class="team-grid">
              <div v-for="member in team" :key="member.id" :class="['team-member', member.status.replace('_', '-')]">
                <div class="member-info">
                  <div class="avatar">{{ getInitials(member.name) }}</div>
                  <div class="details">
                    <span class="name">{{ member.name }}</span>
                    <span class="status">{{ formatStatus(member.status) }} {{ member.callDuration !== '00:00' ? '- ' + member.callDuration : '' }}</span>
                  </div>
                </div>
                <div class="member-metrics">
                  <span :class="['sentiment', getSentimentClass(member.sentiment)]">{{ formatSentiment(member.sentiment) }}</span>
                  <span class="performance">{{ member.performance }}%</span>
                </div>
                <div class="member-actions">
                  <button v-if="member.status === 'on_call'" class="btn btn--outline btn--sm">Monitor</button>
                  <button v-if="member.status === 'on_call'" class="btn btn--secondary btn--sm">Coach</button>
                  <button v-if="member.status === 'available'" class="btn btn--outline btn--sm">Assign Call</button>
                </div>
              </div>
            </div>
          </div>

          <div class="panel">
            <h3>Team Performance</h3>
            <div class="chart-container" style="position: relative; height: 300px;">
              <canvas ref="teamPerformanceChart"></canvas>
            </div>
          </div>

          <div class="panel">
            <h3>Alert Management</h3>
            <div class="alerts-list">
              <div v-for="alert in alerts" :key="alert.id" :class="['alert', alert.priority]">
                <span class="icon">{{ alert.icon }}</span>
                <div class="alert-content">
                  <p>{{ alert.message }}</p>
                  <span class="time">{{ alert.time }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="panel">
            <h3>Whisper Coaching</h3>
            <div class="coaching-interface">
              <div class="active-call-info">
                <span>Coaching: {{ callSession.salesRep }}</span>
                <span class="status live">LIVE</span>
              </div>
              <textarea class="form-control" v-model="whisperMessage" placeholder="Type coaching message..." rows="3"></textarea>
              <button class="btn btn--primary" @click="sendWhisper">Send Whisper</button>
            </div>
          </div>
        </div>
      `,
      setup() {
        const { ref, inject, onMounted } = Vue;
        const dataModels = inject('dataModels');
        const eventBus = inject('eventBus');
        const teamPerformanceChart = ref(null);
        const whisperMessage = ref('');
        
        const alerts = ref([
          {
            id: 1,
            icon: '🚨',
            message: 'John Davis: Competitor mention - requires battle card',
            time: '2 minutes ago',
            priority: 'high-priority'
          },
          {
            id: 2,
            icon: '⚠️',
            message: 'Mike Johnson: Sentiment dropping below threshold',
            time: '5 minutes ago',
            priority: 'medium-priority'
          }
        ]);
        
        const sendWhisper = () => {
          if (whisperMessage.value.trim()) {
            eventBus.emit('whisper-sent', {
              message: whisperMessage.value,
              target: dataModels.callSession.salesRep,
              timestamp: new Date().toISOString()
            });
            whisperMessage.value = '';
          }
        };
        
        const getInitials = (name) => {
          return name.split(' ').map(n => n[0]).join('').toUpperCase();
        };
        
        const formatStatus = (status) => {
          return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        };
        
        const getSentimentClass = (sentiment) => {
          if (sentiment > 0.3) return 'positive';
          if (sentiment < -0.3) return 'negative';
          return 'neutral';
        };
        
        const formatSentiment = (sentiment) => {
          if (sentiment === 0) return '0.00';
          return sentiment > 0 ? `+${sentiment.toFixed(2)}` : sentiment.toFixed(2);
        };
        
        onMounted(() => {
          if (teamPerformanceChart.value && window.Chart) {
            initTeamPerformanceChart();
          }
        });
        
        const initTeamPerformanceChart = () => {
          const ctx = teamPerformanceChart.value;
          if (!ctx) return;
          
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: dataModels.team.map(member => member.name),
              datasets: [{
                label: 'Performance Score',
                data: dataModels.team.map(member => member.performance),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'],
                borderRadius: 4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }
          });
        };
        
        return {
          alerts,
          whisperMessage,
          sendWhisper,
          teamPerformanceChart,
          team: dataModels.team,
          callSession: dataModels.callSession,
          getInitials,
          formatStatus,
          getSentimentClass,
          formatSentiment
        };
      }
    }
  }
];

// ===== MAIN APPLICATION =====
const { createApp, reactive, ref, provide } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

const app = createApp({
  setup() {
    const eventBus = createEventBus();
    
    // Simulation state
    const simulationState = reactive({
      isRunning: false,
      currentTranscriptIndex: 0,
      displayedTranscript: [dataModels.transcript[0]],
      currentSentiment: dataModels.metrics.sentiment.overall,
      currentDuration: "00:00:00",
      activeRTACards: [],
      startTime: null,
      interval: null,
      sentimentChartInstance: null
    });
    
    // RTA Card definitions
    const rtaCardDefinitions = [
      {
        id: 'salesforce',
        trigger: 'Salesforce',
        title: 'Salesforce Competitive Battle Card',
        content: 'Key differentiators: AI conversation intelligence, 40% lower TCO, faster implementation time',
        type: 'competitive'
      },
      {
        id: 'budget',
        trigger: 'budget',
        title: 'Budget Objection Handler',
        content: 'ROI Calculator: Show 3x return in year 1. Mention flexible payment options and pilot program.',
        type: 'objection'
      },
      {
        id: 'hubspot',
        trigger: 'HubSpot',
        title: 'HubSpot Competitive Response',
        content: 'Advanced AI features, better enterprise scalability, superior conversation analytics',
        type: 'competitive'
      }
    ];
    
    // Event handlers
    eventBus.on('call-started', () => {
      simulationState.isRunning = true;
      simulationState.currentTranscriptIndex = 1;
      simulationState.displayedTranscript = [dataModels.transcript[0]];
      simulationState.startTime = Date.now();
      simulationState.activeRTACards = [];
      
      // Clear sentiment chart
      if (simulationState.sentimentChartInstance) {
        simulationState.sentimentChartInstance.data.labels = [];
        simulationState.sentimentChartInstance.data.datasets[0].data = [];
        simulationState.sentimentChartInstance.update();
      }
      
      // Start simulation
      simulationState.interval = setInterval(() => {
        if (simulationState.currentTranscriptIndex < dataModels.transcript.length) {
          const entry = dataModels.transcript[simulationState.currentTranscriptIndex];
          simulationState.displayedTranscript.push(entry);
          simulationState.currentSentiment = entry.sentiment;
          
          // Update sentiment chart
          if (simulationState.sentimentChartInstance) {
            const chart = simulationState.sentimentChartInstance;
            chart.data.labels.push(entry.timestamp);
            chart.data.datasets[0].data.push(entry.sentiment);
            
            // Keep only last 10 data points
            if (chart.data.labels.length > 10) {
              chart.data.labels.shift();
              chart.data.datasets[0].data.shift();
            }
            
            chart.update('none');
          }
          
          // Check for RTA triggers
          checkRTATriggers(entry.text);
          
          // Emit events
          eventBus.emit('transcript-updated', entry);
          eventBus.emit('sentiment-changed', entry.sentiment);
          
          simulationState.currentTranscriptIndex++;
        } else {
          // End simulation
          eventBus.emit('call-ended');
        }
      }, 3000);
    });
    
    eventBus.on('call-paused', () => {
      simulationState.isRunning = false;
      if (simulationState.interval) {
        clearInterval(simulationState.interval);
        simulationState.interval = null;
      }
    });
    
    eventBus.on('call-ended', () => {
      simulationState.isRunning = false;
      if (simulationState.interval) {
        clearInterval(simulationState.interval);
        simulationState.interval = null;
      }
      simulationState.currentTranscriptIndex = 0;
      simulationState.displayedTranscript = [dataModels.transcript[0]];
      simulationState.currentSentiment = dataModels.metrics.sentiment.overall;
      simulationState.activeRTACards = [];
    });
    
    // Update call timer
    setInterval(() => {
      if (simulationState.isRunning && simulationState.startTime) {
        const elapsed = Date.now() - simulationState.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        simulationState.currentDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    }, 1000);
    
    // Check RTA triggers
    const checkRTATriggers = (text) => {
      rtaCardDefinitions.forEach(cardDef => {
        if (text.toLowerCase().includes(cardDef.trigger.toLowerCase())) {
          const existingCard = simulationState.activeRTACards.find(card => card.id === cardDef.id);
          if (!existingCard) {
            simulationState.activeRTACards.push(cardDef);
            eventBus.emit('rta-card-triggered', cardDef);
          }
        }
      });
    };
    
    // Provide data and services to components
    provide('dataModels', dataModels);
    provide('eventBus', eventBus);
    provide('simulationState', simulationState);
    
    return {
      callSession: dataModels.callSession
    };
  }
});

// Create router
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// Register components
app.component('CallControls', CallControls);
app.component('LiveTranscription', LiveTranscription);
app.component('SentimentAnalysis', SentimentAnalysis);
app.component('TalkListenRatio', TalkListenRatio);
app.component('SpeakingPace', SpeakingPace);
app.component('FillerWords', FillerWords);
app.component('RTACards', RTACards);
app.component('WhisperControls', WhisperControls);
app.component('CallSummary', CallSummary);
app.component('SmartTrackers', SmartTrackers);

// Use router
app.use(router);

// Mount app
app.mount('#app');