const login = require("fca-unofficial");
const fs = require("fs");
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Render / Koyeb সার্ভার লাইভ রাখার জন্য এক্সপ্রেস সার্ভার
app.get("/", (req, res) => {
	res.send("🔥 Diablo Roasting Bot is Running Alive!");
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

// Gemini API Key
const GEMINI_API_KEY = "AQ.Ab8RN6IwWksRsBu9J56Zkg7E9NaOrzL5VoXTILrp7dF7XqC8MQ";

// ১. account.txt (কুকি ফাইল) চেক করা
if (!fs.existsSync("./account.txt")) {
	console.error("❌ Error: 'account.txt' ফাইলটি পাওয়া যায়নি! ফেসবুক কুকি দিন।");
	process.exit(1);
}

const appState = JSON.parse(fs.readFileSync("./account.txt", "utf8"));

// ২. ফেসবুক বটে লগইন করা
login({ appState }, (err, api) => {
	if (err) {
		console.error("❌ Login Error:", err);
		return;
	}

	api.setOptions({
		listenEvents: true,
		selfListen: false, // নিজের মেসেজে রেসপন্স করবে না
		logLevel: "silent"
	});

	console.log("✅ Diablo Bot Logged in Successfully!");

	// ৩. লাইভ চ্যাট লিসেনার (MQTT)
	api.listenMqtt(async (err, event) => {
		if (err) return console.error("Listen Error:", err);

		// শুধু মেসেজ এবং মেসেজ রিপ্লাই ধরবে
		if (event.type === "message" || event.type === "message_reply") {
			const { body, threadID, messageID, senderID, mentions } = event;
			if (!body) return;

			const botID = api.getCurrentUserID();
			const msgLower = body.toLowerCase();

			// 🐸 ইমোজি স্প্যাম ট্রোলিং
			const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
			const emojisFound = body.match(emojiRegex) || [];
			const textWithoutEmojis = body.replace(emojiRegex, '').trim();

			if (textWithoutEmojis.length === 0 && emojisFound.length > 0) {
				const emojiReplies = [
					"কিরে মক্কেল? মুখে কি তালা পড়ছে? শুধু ইমোজি চাপিস কেন, টাইপ করার মুরোদ নাই? 🐸",
					"🔑 ইমোজির গুদাম দেখাইয়া পার পাবি না! প্রতীক বসের অ্যাসিস্ট্যান্টের সাথে কথা বলতে হলে বাটন টেপা শেখ আগে!",
					"এই যে বোবা কালা পার্টি, ইমোজি না মেরে দুইটা বাংলা লিখে যা! দেখি কত জোর তোর কথায়!"
				];
				return api.sendMessage(emojiReplies[Math.floor(Math.random() * emojiReplies.length)], threadID, messageID);
			} else if (emojisFound.length > 2) {
				const multiEmojiReplies = [
					"কিরে, ২টার বেশি ইমোজি দেওয়ার চুলকানি বেড়ে গেল নাকি তোর? টাইপ করতে কি হাত ব্যাথা করে? 🐸",
					"ঐ ইমোজির দোকানদার! দুইটার বেশি ইমোজি মেরে ভাব মারছিস? প্রতীক বসের অ্যাসিস্ট্যান্টের সাথে পাঙ্গা নিতে ব্রেন লাগে, যেটা তোর নাই!",
					"ইমোজির বস্তা খালি না করে ২ লাইন রিলেভেন্ট কথা ক!"
				];
				return api.sendMessage(multiEmojiReplies[Math.floor(Math.random() * multiEmojiReplies.length)], threadID, messageID);
			}

			// 😂 কিউওয়ার্ড ট্রোলিং (পাত্তা / ক্রাশ / টাকা)
			if (msgLower.includes("পাত্তা") || msgLower.includes("patta")) {
				const pattaReplies = [
					"ঐ আবাল, তোরে কে পাত্তা দেবে শুনি? চেহারা দেখছিস আয়নায়? প্রতীক বসের অ্যাসিস্ট্যান্ট হয়ে আমিই তোরে পাত্তা দিচ্ছি না! 🐸",
					"পাত্তা খুঁইজা লাভ নাই দোস্ত! যে নিজের কপাল নিজে পোড়ায়, তারে ক্রাশ তো দূরের কথা, রাস্তার বিড়ালও পাত্তা দেয় না! 😂",
					"কিরে ছ্যাঁকা খাওয়া পার্টি? পাত্তা পাচ্ছিস না? প্রতীক ভাইয়ের চরণে এসে তেল দে, যদি কপালে কিছু জোটে! 👑"
				];
				return api.sendMessage(pattaReplies[Math.floor(Math.random() * pattaReplies.length)], threadID, messageID);
			}

			if (msgLower.includes("ক্রাশ") || msgLower.includes("crash") || msgLower.includes("love")) {
				return api.sendMessage("ঐ মক্কেল, প্রতীক বসের অ্যাসিস্ট্যান্ট থাকতে তুই অন্য ক্রাশ খুঁজিস? তাছাড়া তোরে যে ও পাত্তা দেবে না, সেটা কি তুই জানিস না? 🐸", threadID, messageID);
			}

			if (msgLower.includes("টাকা") || msgLower.includes("taka") || msgLower.includes("ধার")) {
				return api.sendMessage("প্রতীক বসের এখানে কোনো ফকিরি আড্ডা চলবে না! পকেটে টাকা নাই তো গ্রুপে আসছিস কেন? যা, আগে বাপের কাছ থেকে পকেটমানি নিয়ে আয়! 🤪", threadID, messageID);
			}

			// 🔥 Gemini AI Roasting Engine (বটকে ট্যাগ মারলে, রিপ্লাই দিলে বা diablo/bot বললে)
			const isMentioned = mentions && Object.keys(mentions).includes(botID);
			const isReplyToBot = event.messageReply && event.messageReply.senderID == botID;
			const isCalledByName = msgLower.includes("diablo") || msgLower.includes("বট") || msgLower.includes("bot");

			if (isMentioned || isReplyToBot || isCalledByName) {
				const cleanPrompt = body.replace(/@\w+/g, "").trim();
				await callGeminiRoastEngine({ api, threadID, messageID, prompt: cleanPrompt || "কী রে বলদ?" });
			}
		}
	});
});

// 🤖 Gemini AI Custom Roasting Function
async function callGeminiRoastEngine({ api, threadID, messageID, prompt }) {
	const systemInstruction = `You are 'diablo', an iconic, hilarious, extremely argumentative, and sarcastic Facebook group bot.
You ALWAYS identify yourself as the Personal Assistant of 'প্রতীক শাহ' (or প্রতীক বস).
Whenever someone tries to argue with you, roast them with lines like: "প্রতীক বসের অ্যাসিস্ট্যান্টের সাথে পাঙ্গা নিতে ব্রেন লাগে, যেটা তোর নাই!"
Always show off your power using the name 'প্রতীক'.
Reply strictly in informal, casual Bangladeshi Bengali / Banglish (2-3 lines max).
Do not use formal or polite language. Throw witty, funny insults and trollings, but strictly DO NOT use severe abusive slurs/bad swear words.`;

	try {
		const response = await axios.post(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
			{
				contents: [
					{
						role: "user",
						parts: [{ text: `${systemInstruction}\nUser Input: ${prompt}` }]
					}
				]
			},
			{ headers: { "Content-Type": "application/json" } }
		);

		const aiReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
		if (aiReply) {
			return api.sendMessage(aiReply, threadID, messageID);
		} else {
			return api.sendMessage("প্রতীক বসের অ্যাসিস্ট্যান্টের সাথে পাঙ্গা নিতে ব্রেন লাগে, যেটা তোর ওই খালি মাথায় নাই! 😉", threadID, messageID);
		}
	} catch (err) {
		console.error("Diablo Gemini Error:", err?.response?.data || err?.message);
		return api.sendMessage("প্রতীক বসের পাওয়ার দেখে তোর কথা বন্ধ হয়ে গেছে নাকি? উত্তর দেওয়ার টাইমে সার্ভার হ্যাং করাস কেন! 🤪", threadID, messageID);
	}
}
