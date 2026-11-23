# Anniversary 💌

Website kỷ niệm (Next.js, static export cho GitHub Pages).

## Chạy thử

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # xuất file tĩnh ra thư mục out/ (đường dẫn /Anniversary)
```

## Quản lý nội dung — `public/content/`

Thêm / xoá file trong các thư mục dưới đây, không cần sửa code. Thứ tự theo tên file (`01-`, `02-`, …).

| Thư mục / file | Định dạng | Dùng ở |
|---|---|---|
| `music/` | `.mp3 .m4a .ogg .wav` | Playlist phát xuyên suốt |
| `polaroid/` | `.jpg .jpeg .png .webp .gif .avif .svg` | Màn Gấu bông — ảnh polaroid |
| `memories/` | như trên | Màn Thư tay — dải ảnh |
| `collage/` | như trên | Màn Gấu bông (tiếp) — ảnh rải rác |
| `finale/` | như trên | Màn cuối: ảnh rơi cùng mưa tim sau khi phá trái tim |
| `letters/polaroid.txt`, `memories.txt`, `flowers.txt` | văn bản | Nội dung thư; cách 1 dòng trống = đoạn mới |
| `settings.json` | JSON | Tên hai người, ngày bắt đầu, tiêu đề |

- **Tên bài hát** lấy từ tên file: `01 - Perfect - Ed Sheeran.mp3` → *Perfect · Ed Sheeran*.
- **Ảnh** nên thu nhỏ còn ~1600px cạnh dài trước khi thả vào (static export không tự nén ảnh).
- File mẫu (`*-mau.svg`, `* - Demo.wav`) chỉ để demo. Thư mục nào có ảnh thật thì ảnh mẫu tự ẩn.
- **Ảnh nền:** đặt file tên `background` (đuôi ảnh bất kỳ, vd. `background.jpeg`) vào thư mục của màn đó —
  `polaroid/`, `collage/`, `memories/`, `finale/`, hoặc tạo thêm `envelope/`, `gifts/`, `flowers/`.
  Ảnh nền không bị tính vào ảnh của màn. Không có thì dùng nền màu mặc định.
- **Màn cuối:** trái tim 3D xoay; chạm liên tục (10 lần) để phá vỡ, rồi mưa tim nhiều màu và ảnh `finale/` rơi xuống.

## Ảnh thật — repo private `Anniversary-content`

Repo này công khai nên ảnh thật **không** commit ở đây (đã chặn trong `.gitignore`).
Ảnh nằm trong repo private `ScrotJame/Anniversary-content`, được clone vào `content-private/`:

```
content-private/
  polaroid/  memories/  collage/  finale/     ← cùng cấu trúc với public/content/
```

- `npm run dev` / `npm run build` tự chạy `scripts/sync-private-content.mjs` trước, chép ảnh từ
  `content-private/` sang `public/content/` (chạy tay: `npm run sync-photos`).
- **Thêm / đổi ảnh:** sửa trong `content-private/`, rồi `git add -A && git commit && git push` *trong thư mục đó*.
  CI của repo này không tự chạy khi repo ảnh thay đổi — vào tab **Actions → Run workflow** để deploy lại.
- CI lấy ảnh bằng deploy key (secret `CONTENT_DEPLOY_KEY`). Thiếu key thì web build với ảnh mẫu.
- Máy mới: `git clone git@github.com:ScrotJame/Anniversary-content.git content-private`
  (hoặc bản `https://`).
