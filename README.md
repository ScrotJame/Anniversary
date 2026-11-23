# Anniversary 💌

Một website nhỏ làm quà kỷ niệm 1 năm yêu nhau: một câu chuyện tương tác, mở từng món quà một, có nhạc nền phát suốt từ đầu đến cuối.

## Website làm gì

1. **Phong thư trước cửa tiệm**: nền là một tiệm quà mùa đông. Chạm vào phong thư để mở. Thư bay lên, tim bung ra, hiện tấm thiệp kỷ niệm, rồi nhạc bắt đầu phát.
2. **Bên trong tiệm**: ba món quà đặt trên kệ (thư tay, gấu bông, bó hoa). Mỗi món mở ra một màn riêng:
   - **Thư tay**: lá thư kèm một dải ảnh kỷ niệm.
   - **Gấu bông**: ảnh polaroid kèm lời nhắn, sau đó là một bức tường ảnh rải rác.
   - **Bó hoa**: một lá thư cùng hoa và cánh hoa rơi.
3. **Món quà cuối** (mở sau khi đã xem đủ ba món): một trái tim 3D đang xoay. Phải chạm liên tục 10 lần, nếu ngừng quá 2 giây thì phải chạm lại từ đầu. Khi đủ, trái tim vỡ tung thành hàng chục trái tim nhỏ. Sau đó là mưa tim nhiều màu, ảnh polaroid vừa rơi vừa lật 3D, rồi hiện lời chúc và số ngày bên nhau.

Trình phát nhạc ở góc màn hình có playlist, chuyển bài và chỉnh âm lượng (âm lượng được nhớ cho lần sau).

Toàn bộ nội dung (ảnh, nhạc, thư, tên, ngày bắt đầu) lấy từ các thư mục trong `public/content/`, nên muốn đổi nội dung thì không cần sửa code. Ảnh thật và nhạc nằm trong một repo private riêng, repo này để công khai mà không lộ dữ liệu cá nhân.

**Công nghệ:** Next.js 16 (App Router, static export), React 19, Tailwind CSS 4, Motion, three.js.

---

## Cài đặt

### Yêu cầu

- [Node.js](https://nodejs.org/) **24+**
- Git

### 1. Clone repo

```bash
git clone https://github.com/ScrotJame/Anniversary.git
cd Anniversary
```

### 2. (Không bắt buộc) Lấy ảnh thật và nhạc từ repo private

Cần quyền truy cập repo `ScrotJame/Anniversary-content`. Clone repo đó vào thư mục `content-private/` nằm trong repo này:

```bash
git clone https://github.com/ScrotJame/Anniversary-content.git content-private
```

Bỏ qua bước này thì web vẫn chạy được, chỉ là dùng ảnh mẫu và không có nhạc.

### 3. Cài thư viện và chạy

```bash
npm install
npm run dev      # http://localhost:3000
```

Các lệnh khác:

```bash
npm run build        # xuất file tĩnh ra thư mục out/ (đường dẫn gốc /Anniversary)
npm test             # chạy unit test
npm run lint         # kiểm tra code
npm run sync-photos  # chép ảnh và nhạc từ content-private/ sang public/content/
```

`npm run dev` và `npm run build` tự chạy `sync-photos` trước, nên thường không phải gọi lệnh này bằng tay.

---

## Tùy chỉnh nội dung: `public/content/`

Thêm hoặc xoá file trong các thư mục dưới đây, không cần sửa code. Thứ tự sắp theo tên file (`01-`, `02-`, …).

| Thư mục / file | Định dạng | Dùng ở |
|---|---|---|
| `music/` | `.mp3 .m4a .ogg .wav` | Playlist phát xuyên suốt |
| `polaroid/` | `.jpg .jpeg .png .webp .gif .avif .svg` | Màn Gấu bông: ảnh polaroid |
| `collage/` | như trên | Màn Gấu bông (tiếp): ảnh rải rác |
| `memories/` | như trên | Màn Thư tay: dải ảnh |
| `finale/` | như trên | Màn cuối: ảnh rơi cùng mưa tim |
| `letters/polaroid.txt`, `memories.txt`, `flowers.txt` | văn bản | Nội dung thư; cách nhau 1 dòng trống là sang đoạn mới |
| `settings.json` | JSON | Tên hai người, ngày bắt đầu (`YYYY-MM-DD`), các tiêu đề, chữ trên thiệp, ngày mở thư (`unlockAt`) |

- **Tên bài hát** lấy từ tên file: `01 - Perfect - Ed Sheeran.mp3` hiện là *Perfect · Ed Sheeran*. Nên dùng mp3 128–192 kbps, nhẹ hơn wav khoảng 10 lần.
- **Ảnh** nên thu nhỏ còn khoảng 1600px ở cạnh dài trước khi bỏ vào, vì static export không tự nén ảnh.
- **Ảnh mẫu** (`*-mau.svg`) chỉ để demo. Thư mục nào có ảnh thật thì ảnh mẫu tự ẩn.
- **Ảnh nền từng màn:** đặt file tên `background.*` (jpg, png, webp, svg) vào thư mục của màn đó, ví dụ `polaroid/`, `collage/`, `memories/`, `finale/`, hoặc tạo thêm `flowers/`. Ảnh nền không bị tính là ảnh của màn.
  - Màn phong thư mặc định dùng `public/shop_bg.svg` (có thể thay bằng `envelope/background.*`).
  - Màn quà luôn dùng `public/inside_shop_bg.svg`, vì vị trí các món quà được căn theo kệ trong ảnh này (xem `GIFTS` trong `src/components/screens/GiftsScreen.tsx`).

### Khoá thư đến một ngày: `unlockAt`

Trong `settings.json`, đặt `"unlockAt": "2026-12-02T00:00:00+07:00"` (ngày giờ kèm múi giờ). Trước thời điểm đó web vẫn vào được và nghe nhạc được, nhưng chạm phong thư chỉ hiện đếm ngược. Đến giờ, chạm lại là thư tự mở, không cần deploy lại.

Đây là khoá thật, không phải chỉ ẩn nút: lúc build, `scripts/seal-content.mts` mã hoá thư và ảnh bằng một khoá AES ngẫu nhiên, rồi khoá đó được mã hoá theo thời gian bằng [drand tlock](https://github.com/drand/tlock-js). Mạng drand chỉ công bố chìa giải mã đúng giờ đã hẹn, nên chỉnh giờ máy hay xem mã nguồn đều không đọc được. Sau khi build, `scripts/strip-sealed.mjs` xoá bản rõ khỏi `out/` và làm build thất bại nếu còn sót chữ trong thư hay ảnh.

### Mật khẩu: `UNLOCK_PASS`

Đặt mật khẩu thì sau ngày mở thư, chạm phong thư sẽ hiện ô nhập mật khẩu. Nhập đúng thì mở thư. Nhập gì khác thì chỉ hiện lời chào và được nghe nhạc (chế độ khách). Không phân biệt hoa/thường, không tính khoảng trắng ở đầu và cuối, nhưng có phân biệt dấu (`hồng` khác `hong`).

- Mật khẩu **không bao giờ để trong repo**. Trên GitHub: Settings → Secrets and variables → Actions → New repository secret, tên `UNLOCK_PASS`. Trên máy: tạo file `.env.local` có dòng `UNLOCK_PASS=...` (file này đã bị `.gitignore` chặn).
- Mật khẩu là lớp khoá thứ hai: thư được mã hoá bằng khoá suy ra từ mật khẩu, rồi mới khoá theo ngày. Nó vẫn có tác dụng sau `unlockAt`.
- Chưa đặt `UNLOCK_PASS` thì CI vẫn deploy (chỉ khoá theo ngày) và hiện cảnh báo.
- Không có server giới hạn số lần thử, nên mật khẩu quá đơn giản có thể bị dò ra bởi người rành máy tính.

Lưu ý chung:

- Build cần mạng (để lấy thông tin của drand).
- Build lại sau thời điểm `unlockAt` thì chỉ còn khoá mật khẩu (nếu có). Không có mật khẩu thì ra bản bình thường, không khoá.
- Khoá chỉ che những gì được deploy. Nội dung đã commit vào repo công khai này thì ai cũng đọc được trên GitHub.

### Ảnh thật và nhạc: luôn để trong `content-private/`

Repo này công khai, nên ảnh (`.jpg .png …`) và nhạc (`.mp3 .wav …`) trong `public/content/` đã bị chặn trong `.gitignore`, không bao giờ bị commit. Muốn thêm hoặc đổi ảnh, nhạc thì:

1. Bỏ file vào `content-private/<thư mục>/` theo cùng cấu trúc với `public/content/`:
   ```
   content-private/
     polaroid/  memories/  collage/  finale/  music/
   ```
2. Chạy `npm run dev` (hoặc `npm run sync-photos`) để chép sang `public/content/`.
3. Lưu lên repo private bằng cách commit và push **trong thư mục `content-private/`**:
   ```bash
   cd content-private
   git add -A && git commit -m "Thêm ảnh" && git push
   ```

Không bỏ file thẳng vào `public/content/`: lần đồng bộ sau sẽ chép đè lên bằng nội dung trong `content-private/`.
