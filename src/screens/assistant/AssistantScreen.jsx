import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import SmartFAQAssistant from "../../utils/SmartFAQAssistant";
import trainData from "../../../train.json";

const { width, height } = Dimensions.get("window");

export function AssistantScreen() {
  const [messages, setMessages] = useState([
    {
      id: "sys-1",
      role: "assistant",
      text: "Hello! I'm CyberRazor AI, your cybersecurity assistant powered by smart matching and Gemini AI. I can answer 326+ questions about CyberRazor, threats, security, and more. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [assistant, setAssistant] = useState(null);

  // Initialize Smart FAQ Assistant with Gemini AI
  useEffect(() => {
    const initAssistant = async () => {
      try {
        // Hardcoded Gemini API key
        const GEMINI_API_KEY = "AIzaSyCMZnDBCGvjDcuOcXEvM1uMjFrZrd87nPU";
        const smartAssistant = new SmartFAQAssistant(trainData, GEMINI_API_KEY);
        setAssistant(smartAssistant);
        console.log("[AssistantScreen] ✅ Smart FAQ Assistant initialized with Gemini AI");
      } catch (error) {
        console.error("[AssistantScreen] ❌ Failed to initialize assistant:", error);
      }
    };
    initAssistant();
  }, []);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  }, []);


  const send = async () => {
    if (!input.trim() || sending || !assistant) return;

    const userMsg = {
      id: String(Date.now()),
      role: "user",
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);
    setIsTyping(true);

    try {
      console.log("[AssistantScreen] 🔍 Processing question:", userMsg.text);

      // Use Smart FAQ Assistant (JSON + Gemini AI)
      const result = await assistant.getAnswer(userMsg.text);
      console.log("[AssistantScreen] Got answer:", {
        source: result.source,
        confidence: result.confidence,
        hasRelated: result.relatedQuestions?.length > 0
      });

      // Build response text with related questions if available
      let responseText = result.answer;
      if (result.relatedQuestions && result.relatedQuestions.length > 0) {
        responseText += `\n\n💡 Related questions:\n${result.relatedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
      }

      // Create match info for badge display (skip for off-topic)
      const matchInfo = result.source === 'off_topic' ? null : {
        matchType: result.source === 'faq_database' ? 'exact' : result.source === 'ai_generated' ? 'ai' : 'fuzzy',
        score: result.confidence,
        confidence: result.confidence >= 0.8 ? 'high' : result.confidence >= 0.65 ? 'medium' : 'low',
        matchedQuestion: result.matchedQuestion,
        source: result.source
      };

      const aiMsg = {
        id: `${userMsg.id}-r`,
        role: "assistant",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        matchInfo: matchInfo,
      };

      setMessages((m) => [...m, aiMsg]);

      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("[AssistantScreen] ❌ Error getting answer:", error);
      const errorMsg = {
        id: `${userMsg.id}-error`,
        role: "assistant",
        text: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setIsTyping(false);
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.role === "user";
    const isLastMessage = index === messages.length - 1;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
          marginBottom: 16,
          alignItems: isUser ? "flex-end" : "flex-start",
        }}
      >
        <View
          style={{
            maxWidth: "80%",
            padding: 16,
          }}
        >
          {!isUser && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                <Ionicons name="shield-checkmark" size={14} color="#00d4ff" />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: "#00d4ff",
                  fontWeight: "600",
                }}
              >
                CyberRazor AI
              </Text>
            </View>
          )}

          <Text
            style={{
              fontSize: 16,
              color: "#ffffff",
              lineHeight: 22,
            }}
          >
            {item.text}
          </Text>

          {/* Show match confidence badge for assistant messages */}
          {!isUser && item.matchInfo && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
                backgroundColor:
                  item.matchInfo.confidence === "high"
                    ? "rgba(34, 197, 94, 0.15)"
                    : item.matchInfo.confidence === "medium"
                    ? "rgba(234, 179, 8, 0.15)"
                    : "rgba(100, 116, 139, 0.15)",
                borderRadius: 12,
                alignSelf: "flex-start",
              }}
            >
              <Ionicons
                name={
                  item.matchInfo.matchType === "exact"
                    ? "checkmark-circle"
                    : "search"
                }
                size={12}
                color={
                  item.matchInfo.confidence === "high"
                    ? "#22c55e"
                    : item.matchInfo.confidence === "medium"
                    ? "#eab308"
                    : "#64748b"
                }
              />
              <Text
                style={{
                  fontSize: 10,
                  color:
                    item.matchInfo.confidence === "high"
                      ? "#22c55e"
                      : item.matchInfo.confidence === "medium"
                      ? "#eab308"
                      : "#64748b",
                  marginLeft: 4,
                  fontWeight: "600",
                }}
              >
                {item.matchInfo.source === 'ai_generated' 
                  ? '🤖 AI Generated'
                  : item.matchInfo.source === 'faq_database'
                  ? '📚 FAQ Match'
                  : '🔍 Fuzzy Match'}
                {item.matchInfo.score
                  ? ` (${(item.matchInfo.score * 100).toFixed(0)}%)`
                  : ""}
              </Text>
            </View>
          )}

          <Text
            style={{
              fontSize: 11,
              color: "#64748b",
              marginTop: 8,
              textAlign: isUser ? "right" : "left",
            }}
          >
            {item.timestamp}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          marginBottom: 16,
          alignItems: "flex-start",
        }}
      >
        <View
          style={{
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="shield-checkmark" size={14} color="#00d4ff" />
          </View>
          <ActivityIndicator size="small" color="#00d4ff" />
          <Text
            style={{
              fontSize: 14,
              color: "#8892b0",
              marginLeft: 8,
            }}
          >
            AI is analyzing...
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={["#0a0a0f", "#1a1a2e", "#16213e", "#0f3460"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* Animated Background Elements */}
      <Animated.View
        style={{
          position: "absolute",
          top: height * 0.15,
          right: -30,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: "#00d4ff",
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 0.2],
          }),
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <Animated.View
          style={{
            paddingHorizontal: 24,
            paddingTop: 60,
            paddingBottom: 20,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(0, 212, 255, 0.1)",
                borderWidth: 2,
                borderColor: "rgba(0, 212, 255, 0.3)",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name="chatbubbles" size={20} color="#00d4ff" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 24,
                  color: "#ffffff",
                  fontWeight: "bold",
                  textShadowColor: "#00d4ff",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
                }}
              >
                AI Assistant
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#b0c4de",
                }}
              >
                Powered by Gemini AI
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          ListFooterComponent={renderTypingIndicator}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Input Area */}
        <Animated.View
          style={{
            paddingHorizontal: 20,
            paddingBottom: Platform.OS === "ios" ? 34 : 20,
            paddingTop: 16,
            opacity: fadeAnim,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 25,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: "#ffffff",
                paddingVertical: 8,
                paddingRight: 12,
              }}
              placeholder="Ask about security threats, alerts, or get recommendations..."
              placeholderTextColor="#64748b"
              value={input}
              onChangeText={setInput}
              editable={!sending}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              onPress={send}
              disabled={sending || !input.trim()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor:
                  !input.trim() || sending
                    ? "rgba(100, 116, 139, 0.3)"
                    : "#00d4ff",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#00d4ff",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: !input.trim() || sending ? 0 : 0.3,
                shadowRadius: 4,
                elevation: !input.trim() || sending ? 0 : 3,
              }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons
                  name="send"
                  size={18}
                  color={!input.trim() || sending ? "#64748b" : "#000000"}
                />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
