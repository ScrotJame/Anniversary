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
| `finale/` | như trên (lấy ảnh đầu tiên) | Màn cuối "HAPPY ANNIVERSARY" |
| `letters/polaroid.txt`, `memories.txt`, `flowers.txt` | văn bản | Nội dung thư; cách 1 dòng trống = đoạn mới |
| `settings.json` | JSON | Tên hai người, ngày bắt đầu, tiêu đề |

- **Tên bài hát** lấy từ tên file: `01 - Perfect - Ed Sheeran.mp3` → *Perfect · Ed Sheeran*.
- **Ảnh** nên thu nhỏ còn ~1600px cạnh dài trước khi thả vào (static export không tự nén ảnh).
- File mẫu (`*-mau.svg`, `* - Demo.wav`) chỉ để demo — xoá đi khi có nội dung thật.
