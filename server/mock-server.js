const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 8188;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const mockNodes = {
  CLIPTextEncode: {
    input: { required: { text: { type: 'STRING', label: 'Text' }, clip: { type: 'CLIP', label: 'CLIP' } } },
    output: ['CONDITIONING'],
    category: 'conditioning',
    python_module: 'clip',
    description: ''
  },
  KSampler: {
    input: {
      required: {
        model: { type: 'MODEL', label: 'Model' },
        seed: { type: 'INT', label: 'Seed' },
        steps: { type: 'INT', label: 'Steps' },
        cfg: { type: 'FLOAT', label: 'CFG' },
        sampler_name: { type: 'COMBO', label: 'Sampler', options: ['euler', 'euler_ancestral', 'heun'] },
        scheduler: { type: 'COMBO', label: 'Scheduler', options: ['normal', 'karras', 'exponential'] },
        positive: { type: 'CONDITIONING', label: 'Positive' },
        negative: { type: 'CONDITIONING', label: 'Negative' },
        latent_image: { type: 'LATENT', label: 'Latent' }
      }
    },
    output: ['LATENT'],
    category: 'sampling',
    python_module: 'samplers',
    description: ''
  },
  VAEDecode: {
    input: { required: { samples: { type: 'LATENT', label: 'Samples' }, vae: { type: 'VAE', label: 'VAE' } } },
    output: ['IMAGE'],
    category: 'latent',
    python_module: 'vae',
    description: ''
  },
  CheckpointLoaderSimple: {
    input: { required: { ckpt_name: { type: 'STRING', label: 'Checkpoint Name' } } },
    output: ['MODEL', 'CLIP', 'VAE'],
    category: 'loaders',
    python_module: 'loaders',
    description: ''
  },
  EmptyLatentImage: {
    input: { required: { width: { type: 'INT', label: 'Width' }, height: { type: 'INT', label: 'Height' }, batch_size: { type: 'INT', label: 'Batch Size' } } },
    output: ['LATENT'],
    category: 'latent',
    python_module: 'latent',
    description: ''
  },
  SaveImage: {
    input: { required: { images: { type: 'IMAGE', label: 'Images' } }, optional: { filename_prefix: { type: 'STRING', label: 'Filename Prefix', default: 'ComfyUI' } } },
    output: [],
    category: 'output',
    python_module: 'output',
    description: ''
  }
};

app.get('/system_stats', (req, res) => res.json({ nodes: 0, gpu_name: 'NVIDIA RTX 4090', vram_total: 24564, vram_used: 1024, cpu_name: 'Intel Core i9', system_ram: 65536, system_ram_used: 8192 }));
app.get('/api/system_stats', (req, res) => res.json({ nodes: 0, gpu_name: 'NVIDIA RTX 4090', vram_total: 24564, vram_used: 1024, cpu_name: 'Intel Core i9', system_ram: 65536, system_ram_used: 8192 }));

app.get('/object_info', (req, res) => res.json(mockNodes));
app.get('/api/object_info', (req, res) => res.json(mockNodes));

app.get('/model_list', (req, res) => res.json({ models: ['SD1.5/model.safetensors', 'SD2.1/model.safetensors', 'SDXL/model.safetensors'] }));
app.get('/api/model_list', (req, res) => res.json({ models: ['SD1.5/model.safetensors', 'SD2.1/model.safetensors', 'SDXL/model.safetensors'] }));

app.get('/samplers', (req, res) => res.json([{ name: 'euler', label: 'Euler' }, { name: 'euler_ancestral', label: 'Euler Ancestral' }, { name: 'heun', label: 'Heun' }]));
app.get('/api/samplers', (req, res) => res.json([{ name: 'euler', label: 'Euler' }, { name: 'euler_ancestral', label: 'Euler Ancestral' }, { name: 'heun', label: 'Heun' }]));

app.get('/settings', (req, res) => res.json({}));
app.get('/api/settings', (req, res) => res.json({}));
app.get('/api/settings/:key', (req, res) => res.json({ value: false }));

app.get('/i18n', (req, res) => res.json({}));
app.get('/api/i18n', (req, res) => res.json({}));

app.get('/api/userdata', (req, res) => res.json([]));
app.get('/api/userdata/user.css', (req, res) => { res.setHeader('Content-Type', 'text/css'); res.send(''); });

app.post('/prompt', (req, res) => res.json({ prompt_id: Date.now().toString(), number: 0 }));
app.post('/api/prompt', (req, res) => res.json({ prompt_id: Date.now().toString(), number: 0 }));

app.get('/history/:promptId', (req, res) => res.json({ [req.params.promptId]: { prompt: {}, outputs: {}, status: { completed: true, status: 'completed' } } }));
app.get('/api/history/:promptId', (req, res) => res.json({ [req.params.promptId]: { prompt: {}, outputs: {}, status: { completed: true, status: 'completed' } } }));
app.get('/api/history', (req, res) => res.json({}));

app.get('/queue', (req, res) => res.json({ queue_running: [], queue_pending: [] }));
app.get('/api/queue', (req, res) => res.json({ queue_running: [], queue_pending: [] }));
app.delete('/queue', (req, res) => res.json({}));
app.delete('/api/queue', (req, res) => res.json({}));

app.post('/upload/image', (req, res) => res.json({ name: 'uploaded.png' }));
app.post('/api/upload/image', (req, res) => res.json({ name: 'uploaded.png' }));
app.get('/upload/image', (req, res) => res.json([]));
app.get('/api/upload/image', (req, res) => res.json([]));

app.get('/embeddings', (req, res) => res.json([]));
app.get('/api/embeddings', (req, res) => res.json([]));

app.get('/loras', (req, res) => res.json([]));
app.get('/api/loras', (req, res) => res.json([]));

app.get('/controlnet', (req, res) => res.json([]));
app.get('/api/controlnet', (req, res) => res.json([]));

app.get('/users', (req, res) => res.json({ id: 'local', name: 'Local User' }));
app.get('/api/users', (req, res) => res.json({ id: 'local', name: 'Local User' }));

app.post('/auth/token', (req, res) => res.json({ access_token: 'mock-token', token_type: 'Bearer' }));

app.get('/workflows', (req, res) => res.json([]));
app.get('/api/workflows', (req, res) => res.json([]));

app.get('/workflow_templates', (req, res) => res.json({}));
app.get('/api/workflow_templates', (req, res) => res.json({}));

app.get('/api/jobs', (req, res) => {
  res.json({
    jobs: [],
    pagination: {
      total: 0,
      offset: parseInt(req.query.offset) || 0,
      limit: parseInt(req.query.limit) || 200,
      has_more: false
    }
  });
});

app.get('/api/model_folders', (req, res) => res.json([{ name: 'checkpoints', type: 'model' }, { name: 'vae', type: 'vae' }, { name: 'loras', type: 'lora' }]));
app.get('/api/experiment/models', (req, res) => res.json([]));

app.get('/extensions', (req, res) => res.json([]));
app.get('/api/extensions', (req, res) => res.json([]));

app.get('/internal/folder_paths', (req, res) => res.json({}));
app.get('/internal/logs', (req, res) => res.json([]));

app.get('/', (req, res) => res.send('ComfyUI Mock Server'));

wss.on('connection', (ws) => {
  const clientId = Math.random().toString(36).substring(2, 15);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'feature_flags') {
        ws.send(JSON.stringify({ type: 'status', data: { sid: clientId, status: 'idle', exec_info: { queue_remaining: 0 } } }));
      }
    } catch (e) {
      console.log('WS message error:', e.message);
    }
  });

  ws.send(JSON.stringify({ type: 'status', data: { sid: clientId, status: 'idle', exec_info: { queue_remaining: 0 } } }));
});

server.listen(PORT, () => {
  console.log(`ComfyUI Mock Server running on http://localhost:${PORT}`);
});
