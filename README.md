# 🎞️ Sanity Plugin: Cincopa Uploader

A Sanity Studio v3 plugin for uploading and managing assets with [Cincopa](https://www.cincopa.com/).

This plugin allows editors to upload media files or link existing Cincopa assets directly from within the Sanity Studio interface.

---

## ✨ Features

- 📤 Upload media to Cincopa from within Sanity (via file or URL)
- 🔍 Search assets by **title** or **Cincopa Asset ID**
- 🔗 Store and display uploaded asset metadata
- 🔐 Uses your Cincopa API Token for secure access

---

## 🛠 Installation

```bash
npm install sanity-plugin-cincopa-uploader@latest
```

> This plugin is built for **Sanity Studio v3**.

### 🔑 Requirements

- A [Cincopa](https://www.cincopa.com/) account
- A Cincopa **API Token** with `Full Access` permissions

---

## 🚀 Usage

### 1. Configure the plugin in `sanity.config.ts` (or `.js`):

```ts
import { defineConfig } from 'sanity'
import { cincopaUploader } from 'sanity-plugin-cincopa-uploader'

export default defineConfig({
  plugins: [cincopaUploader()],
})
```

---

## 🧩 Optional: Use Cincopa Assets in the Portable Text Editor

This enables editors to insert and manage Cincopa assets inline within Portable Text editors.

```ts
  import { defineField } from 'sanity'

  defineField({
    name: 'body',
    type: 'array',
    of: [
      { type: 'block' },
      { type: 'cincopa_asset' }
    ]
  })

```

---

## 🧩 Optional: Use Sanity Cincopa Assets in the Portable Text Editor

This enables editors to insert and manage Cincopa assets inline within Portable Text editors.

```ts
  import { defineField } from 'sanity'

  defineField({
    name: 'body',
    type: 'array',
    of: [
      { type: 'block' },
      { type: 'sanity_cincopa_asset' }
    ]
  })

```

---

## 🧪 Develop & Test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit) for development tooling.

To test it in your studio with hot reload:

```bash
npm run dev
```

See: [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)

---

## 💬 Support

Need help? Reach out to [support@cincopa.com](mailto:support@cincopa.com)

---

## 📄 License

[MIT](LICENSE) © Davit