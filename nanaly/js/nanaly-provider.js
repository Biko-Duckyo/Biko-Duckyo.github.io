/* Provider-specific parameters stay here, never in the credential store. */
(() => {
  'use strict'
  const endpoint = value => {
    const url = new URL(value)
    if (url.username || url.password || url.search || url.hash ||
        (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))))
      throw new Error('模型接口地址无效，请检查设置')
    return url.href.replace(/\/+$/, '') + '/chat/completions'
  }
  const request = ({ cfg, secrets, messages, deep = false, vision = false, stream = true, tools, tool_choice, json = false }) => {
    // 只有配置了视觉密钥才允许路由到视觉接口，绝不把 DeepSeek key 误发到别家。
    const containsImages = Array.isArray(messages) && messages.some(message => Array.isArray(message && message.content)
      && message.content.some(part => part && part.type === 'image_url'))
    const useVision = vision || containsImages || !secrets.apiKey
    const key = useVision ? secrets.visionKey : secrets.apiKey
    if (!key) throw new Error(useVision ? '请先在设置里填写硅基流动视觉 API Key' : '请先填写文字模型 API Key')
    const url = endpoint(useVision ? cfg.visionBaseURL : cfg.baseURL)
    const host = new URL(url).hostname
    const payload = {
      model: useVision ? cfg.visionModel : deep ? cfg.reasonModel : cfg.model,
      messages, stream, max_tokens: tools ? (deep ? 6144 : 2048) : 8192
    }
    if (stream) payload.stream_options = { include_usage: true }
    if (host === 'api.deepseek.com') {
      payload.thinking = { type: deep ? 'enabled' : 'disabled' }
      if (deep) payload.reasoning_effort = cfg.reasonEffort
      else payload.temperature = tools ? 0 : 0.7
    } else if (host === 'api.siliconflow.cn' || host === 'api-st.siliconflow.cn') {
      payload.enable_thinking = deep
      if (deep) payload.thinking_budget = 4096
    }
    if (tools) { payload.tools = tools; payload.tool_choice = tool_choice || 'auto' }
    // 要模型保证回一个合法的 JSON 对象（复习页出题）。DeepSeek 和硅基流动都支持，提示词里要写明返回 JSON。
    if (json) payload.response_format = { type: 'json_object' }
    return { url, key, payload }
  }
  const responseError = async response => {
    let detail = ''
    try {
      const body = await response.json()
      detail = String(body.error?.message || body.message || '').slice(0, 400)
    } catch (_) {}
    const hints = { 401: '密钥无效或已过期', 403: '账号或模型权限不足，请检查服务商控制台', 404: '模型或接口不存在，请检查设置', 429: '请求过于频繁或额度不足，请稍后重试' }
    return new Error((hints[response.status] || '模型服务暂时不可用') + '（' + response.status + '）' + (detail ? '：' + detail : ''))
  }
  window.NANALY_PROVIDER = Object.freeze({ request, responseError })
})()
