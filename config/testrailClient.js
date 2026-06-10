// config/testrailClient.js
// Минималистичный клиент TestRail API v2 (без внешних зависимостей).
// Cloud: base = `${url}/index.php?/api/v2`. Auth = Basic base64(user:apiKey).

export class TestRailClient {
  constructor({ url, user, apiKey }) {
    if (!url || !user || !apiKey) {
      throw new Error('TestRailClient: url, user, apiKey are required');
    }
    this.base = `${url.replace(/\/+$/, '')}/index.php?/api/v2`;
    this.headers = {
      Authorization: `Basic ${Buffer.from(`${user}:${apiKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  async _request(method, endpoint, body) {
    const res = await fetch(`${this.base}/${endpoint}`, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`TestRail ${method} ${endpoint} → ${res.status}: ${text}`);
    }
    return text ? JSON.parse(text) : {};
  }

  get(endpoint)        { return this._request('GET', endpoint); }
  post(endpoint, body) { return this._request('POST', endpoint, body); }

  // get_* эндпоинты в новых версиях пагинированы: { items..., _links }.
  // Возвращаем массив независимо от формы ответа.
  _unwrap(data, key) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data[key])) return data[key];
    return [];
  }

  async getSuites(projectId)     { return this._unwrap(await this.get(`get_suites/${projectId}`), 'suites'); }
  async getSections(projectId, suiteId) {
    return this._unwrap(await this.get(`get_sections/${projectId}&suite_id=${suiteId}`), 'sections');
  }
  async getPriorities()          { return this._unwrap(await this.get('get_priorities'), 'priorities'); }
  async getTemplates(projectId)  { return this._unwrap(await this.get(`get_templates/${projectId}`), 'templates'); }
  async getRuns(projectId, suiteId) {
    const q = suiteId ? `&suite_id=${suiteId}` : '';
    return this._unwrap(await this.get(`get_runs/${projectId}${q}`), 'runs');
  }

  addSection(projectId, body)  { return this.post(`add_section/${projectId}`, body); }
  addCase(sectionId, body)     { return this.post(`add_case/${sectionId}`, body); }
  updateCase(caseId, body)     { return this.post(`update_case/${caseId}`, body); }
  addResultForCase(runId, caseId, body) {
    return this.post(`add_result_for_case/${runId}/${caseId}`, body);
  }
}
