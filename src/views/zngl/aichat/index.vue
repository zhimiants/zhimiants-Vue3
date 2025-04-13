<template>
  <div class="aichat-container">
    <div class="chat-header">
      <h2>AI助农顾问</h2>
    </div>
    
    <div class="chat-messages" ref="chatMessagesRef">
      <div v-if="messages.length === 0" class="welcome-message">
        <h3>欢迎使用AI助农顾问</h3>
        <p>您可以向我咨询农业相关的问题，例如：</p>
        <div class="example-questions">
          <div class="question-pill" @click="askQuestion('水稻种植的最佳时间是什么时候？')">
            水稻种植的最佳时间是什么时候？
          </div>
          <div class="question-pill" @click="askQuestion('小麦常见病虫害的防治方法有哪些？')">
            小麦常见病虫害的防治方法有哪些？
          </div>
          <div class="question-pill" @click="askQuestion('如何提高农作物的产量？')">
            如何提高农作物的产量？
          </div>
          <div class="question-pill" @click="askQuestion('农田水利灌溉技术有哪些？')">
            农田水利灌溉技术有哪些？
          </div>
        </div>
        
        <div class="upload-tip">
          <p>请描述您看到的内容：</p>
          <div class="question-pill" @click="askQuestion('我的水稻叶子发黄卷曲，可能是什么问题？')">
            我的水稻叶子发黄卷曲，可能是什么问题？
          </div>
          <div class="question-pill" @click="askQuestion('玉米叶片上有黑色斑点，边缘发黄，这是什么病害？')">
            玉米叶片上有黑色斑点，边缘发黄，这是什么病害？
          </div>
        </div>
        
        <div class="upload-tip">
          <p>您可以使用以下命令生成农业相关的图片</p>
          <div class="question-pill" @click="askQuestion('/生成图片 农田稻谷丰收的景象')">
            /生成图片 农田稻谷丰收的景象
          </div>
          <div class="question-pill" @click="askQuestion('/画图 向日葵田野和蓝天')">
            /画图 向日葵田野和蓝天
          </div>
        </div>
      </div>
      
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
        <div class="avatar">
          <el-avatar :icon="message.role === 'user' ? UserFilled : ChatDotRound" :size="40" 
            :class="message.role === 'user' ? 'user-avatar' : 'assistant-avatar'" />
        </div>
        <div class="content">
          <div v-if="message.image" class="message-image">
            <img :src="message.image" alt="用户上传的图片" />
          </div>
          <div class="message-text" v-if="message.content" v-html="formatMessage(message.content)"></div>
          <div v-if="message.generatedImage" class="generated-image">
            <img :src="message.generatedImage" alt="AI生成的图片" />
            <div class="image-actions">
              <el-button size="small" type="primary" @click="downloadImage(message.generatedImage)">
                下载图片
              </el-button>
            </div>
          </div>
          <div v-if="message.role === 'assistant' && message.loading" class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="chat-input">
      <div class="input-controls">
        <!-- 移除图片上传按钮和预览区域 -->
      </div>
      
      <el-input
        v-model="userInput"
        type="textarea"
        :rows="3"
        placeholder="请输入您的问题或使用'/生成图片'命令..."
        resize="none"
        @keyup.enter.exact="sendMessage"
      />
      <el-button 
        type="primary" 
        :icon="Promotion"
        :loading="loading"
        :disabled="!userInput.trim() || loading"
        @click="sendMessage"
      >
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { UserFilled, ChatDotRound, Promotion } from '@element-plus/icons-vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// 配置marked使用highlight.js进行代码高亮
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
  gfm: true,
  breaks: true
});

const API_KEY = 'sk-kawcqajfqchiodrrqlldnxdjciyuzngmibrveasmjxbxheja';
const CHAT_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const IMAGE_API_URL = 'https://api.siliconflow.cn/v1/images/generations';

const chatMessagesRef = ref(null);
const userInput = ref('');
const messages = ref([]);
const loading = ref(false);

// 格式化消息（将markdown转换为HTML）
const formatMessage = (content) => {
  return marked(content);
};

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
};

// 监听消息列表变化，自动滚动到底部
watch(messages, () => {
  scrollToBottom();
}, { deep: true });

// 发送消息到API
const sendMessageToAPI = async (messageHistory) => {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'Qwen/QwQ-32B',
        messages: messageHistory,
        stream: false,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.7
      })
    };
    
    console.log('发送请求到聊天API:', JSON.stringify(options, null, 2));
    const response = await fetch(CHAT_API_URL, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('聊天API返回错误:', errorData);
      throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('聊天API返回结果:', data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 生成图片API
const generateImage = async (prompt) => {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'Kwai-Kolors/Kolors',
        prompt: prompt,
        negative_prompt: '',
        image_size: '1024x1024',
        batch_size: 1,
        num_inference_steps: 20,
        guidance_scale: 7.5
      })
    };
    
    console.log('发送请求到图片生成API:', JSON.stringify(options, null, 2));
    const response = await fetch(IMAGE_API_URL, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('图片生成API返回错误:', errorData);
      throw new Error(errorData.error?.message || `图片生成失败: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('图片生成API返回结果:', data);
    
    if (!data.images || !data.images.length || !data.images[0].url) {
      throw new Error('图片生成API返回数据格式错误');
    }
    
    return data.images[0].url;
  } catch (error) {
    console.error('图片生成API请求错误:', error);
    throw error;
  }
};

// 预设问题
const askQuestion = (question) => {
  userInput.value = question;
  sendMessage();
};

// 发送消息
const sendMessage = async () => {
  const message = userInput.value.trim();
  
  // 修改条件判断，只检查文本消息
  if (!message || loading.value) return;
  
  // 添加用户消息
  const userMessage = { role: 'user', content: message };
  
  messages.value.push(userMessage);
  userInput.value = '';
  
  // 添加助手"正在输入"的临时消息
  const assistantMessageIndex = messages.value.length;
  messages.value.push({ role: 'assistant', loading: true });
  
  loading.value = true;
  
  try {
    // 检查是否为图片生成请求
    const isImageGenerationRequest = message.includes('/生成图片') || message.includes('/画图') || message.includes('/生成') || message.includes('/绘画');
    
    if (isImageGenerationRequest) {
      // 提取提示词 (移除命令前缀)
      let imagePrompt = message.replace(/\/(生成图片|画图|生成|绘画)\s*/g, '').trim();
      
      if (!imagePrompt) {
        throw new Error('请提供图片描述，例如：/生成图片 向日葵田野');
      }
      
      // 生成图片
      try {
        const imageUrl = await generateImage(imagePrompt);
        
        // 更新助手消息
        messages.value[assistantMessageIndex] = { 
          role: 'assistant', 
          content: `以下是根据"${imagePrompt}"生成的图片：`,
          generatedImage: imageUrl
        };
      } catch (error) {
        throw new Error(`图片生成失败: ${error.message}`);
      }
    } else {
      // 常规对话处理
      // 准备消息历史，移除对图片的过滤
      const messageHistory = messages.value
        .filter(msg => !msg.loading && !msg.generatedImage)
        .map(msg => ({ role: msg.role, content: msg.content }));
      
      try {
        // 发送请求到API
        const response = await sendMessageToAPI(messageHistory);
        
        // 更新助手消息
        messages.value[assistantMessageIndex] = { 
          role: 'assistant', 
          content: response
        };
      } catch (error) {
        throw new Error(`聊天请求失败: ${error.message}`);
      }
    }
  } catch (error) {
    // 删除加载中的消息
    messages.value.splice(assistantMessageIndex, 1);
    
    // 显示错误
    ElMessage.error(error.message);
    console.error('处理消息失败:', error);
  } finally {
    loading.value = false;
  }
};

// 下载生成的图片
const downloadImage = (imageUrl) => {
  // 创建临时链接
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `AI生成图片_${new Date().getTime()}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(() => {
  // 添加欢迎消息
  messages.value.push({
    role: 'assistant',
    content: '您好！我是您的AI助农顾问，有任何农业相关问题，都可以向我咨询。\n\n您可以使用"/生成图片 [描述]"或"/画图 [描述]"命令让我生成农业相关图片。\n\n注意：当前版本不支持图片上传功能。如果您想了解植物或农作物的情况，可以直接描述您看到的内容，我会尽力提供专业建议。'
  });
});
</script>

<style scoped lang="scss">
.aichat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  background-color: #f5f7fa;
  
  .chat-header {
    background-color: #fff;
    padding: 15px 20px;
    border-bottom: 1px solid #e6e6e6;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    h2 {
      margin: 0;
      color: #303133;
    }
  }
  
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    
    .welcome-message {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      
      h3 {
        margin-top: 0;
        color: #303133;
      }
      
      p {
        color: #606266;
      }
      
      .example-questions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
        margin-top: 16px;
      }
      
      .upload-tip {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px dashed #dcdfe6;
      }
      
      .question-pill {
        background-color: #ecf5ff;
        color: #409eff;
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s;
        font-size: 14px;
        
        &:hover {
          background-color: #409eff;
          color: white;
        }
      }
    }
    
    .message {
      display: flex;
      margin-bottom: 24px;
      
      .avatar {
        margin-right: 16px;
        flex-shrink: 0;
      }
      
      .user-avatar {
        background-color: #409eff;
      }
      
      .assistant-avatar {
        background-color: #67c23a;
      }
      
      .content {
        background-color: #fff;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        max-width: 85%;
        
        .message-image {
          margin-bottom: 12px;
          
          img {
            max-width: 100%;
            max-height: 300px;
            border-radius: 4px;
          }
        }
        
        .message-text {
          color: #303133;
          word-break: break-word;
          line-height: 1.6;
          
          :deep(p) {
            margin: 8px 0;
          }
          
          :deep(code) {
            background-color: #f5f7fa;
            padding: 2px 4px;
            border-radius: 4px;
          }
          
          :deep(pre) {
            background-color: #f5f7fa;
            padding: 12px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 16px 0;
          }
          
          :deep(a) {
            color: #409eff;
          }
          
          :deep(ul, ol) {
            padding-left: 20px;
          }
          
          :deep(img) {
            max-width: 100%;
            border-radius: 4px;
          }
        }
        
        .generated-image {
          margin-top: 12px;
          border-radius: 8px;
          overflow: hidden;
          
          img {
            width: 100%;
            max-width: 512px;
            border-radius: 4px;
            display: block;
          }
          
          .image-actions {
            margin-top: 8px;
            display: flex;
            justify-content: flex-end;
          }
        }
        
        .typing-indicator {
          display: flex;
          align-items: center;
          height: 20px;
          
          span {
            height: 10px;
            width: 10px;
            margin: 0 2px;
            background-color: #a0a0a0;
            border-radius: 50%;
            display: inline-block;
            animation: typing 1.5s infinite ease-in-out;
            
            &:nth-child(1) {
              animation-delay: 0s;
            }
            
            &:nth-child(2) {
              animation-delay: 0.2s;
            }
            
            &:nth-child(3) {
              animation-delay: 0.4s;
            }
          }
        }
      }
      
      &.user {
        flex-direction: row-reverse;
        
        .avatar {
          margin-right: 0;
          margin-left: 16px;
        }
        
        .content {
          background-color: #ecf5ff;
        }
      }
    }
  }
  
  .chat-input {
    background-color: #fff;
    padding: 16px;
    border-top: 1px solid #e6e6e6;
    display: flex;
    flex-direction: column;
    
    .input-controls {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      // 移除图片上传相关样式
    }
    
    .el-input {
      flex: 1;
      margin-right: 16px;
    }
    
    .el-button {
      align-self: flex-end;
    }
  }
}

@keyframes typing {
  0% {
    transform: translateY(0px);
    background-color: #a0a0a0;
  }
  28% {
    transform: translateY(-7px);
    background-color: #606060;
  }
  44% {
    transform: translateY(0px);
    background-color: #a0a0a0;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .aichat-container {
    .chat-messages {
      .message {
        .content {
          max-width: 75%;
        }
      }
    }
  }
}
</style>
