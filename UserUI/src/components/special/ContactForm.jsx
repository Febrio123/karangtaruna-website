import { useState } from 'react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || '';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    subjek: '',
    pesan: '',
    _gotcha: '',
  });
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});

  function validate() {
    const newErrors = {};
    if (!formData.nama || formData.nama.length < 2)
      newErrors.nama = 'Nama minimal 2 karakter';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email tidak valid';
    if (!formData.subjek) newErrors.subjek = 'Subjek wajib diisi';
    if (!formData.pesan || formData.pesan.length < 10)
      newErrors.pesan = 'Pesan minimal 10 karakter';
    return newErrors;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function handleBlur(e) {
    const { name } = e.target;
    const validationErrors = validate();
    if (validationErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validationErrors[name] }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    if (!FORMSPREE_ENDPOINT) {
      setStatus('noendpoint');
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: formData.nama,
          email: formData.email,
          subjek: formData.subjek,
          pesan: formData.pesan,
          _gotcha: formData._gotcha,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ nama: '', email: '', subjek: '', pesan: '', _gotcha: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot field - hidden from real users */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          opacity: 0,
          height: 0,
          width: 0,
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <label htmlFor="gotcha">Jangan isi ini</label>
        <input
          id="gotcha"
          name="_gotcha"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={formData._gotcha}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-4" aria-live="polite">
        {status === 'success' && (
          <Alert variant="success">
            Pesan berhasil dikirim. Kami akan merespons segera.
          </Alert>
        )}
        {status === 'error' && (
          <Alert variant="error">
            Gagal mengirim pesan. Silakan coba lagi atau hubungi kami langsung.
          </Alert>
        )}
        {status === 'noendpoint' && (
          <Alert variant="warning">
            Form kontak belum terkonfigurasi. Silakan hubungi kami langsung via email.
          </Alert>
        )}

        <Input
          label="Nama"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.nama}
          required
          maxLength={100}
          placeholder="Masukkan nama lengkap"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          required
          maxLength={100}
          placeholder="contoh@email.com"
        />

        <Input
          label="Subjek"
          name="subjek"
          value={formData.subjek}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.subjek}
          required
          maxLength={200}
          placeholder="Subjek pesan"
        />

        <Textarea
          label="Pesan"
          name="pesan"
          value={formData.pesan}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.pesan}
          required
          maxLength={2000}
          rows={5}
          placeholder="Tuliskan pesan Anda di sini..."
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={status === 'submitting'}
          className="w-full sm:w-auto"
        >
          {status === 'submitting' ? 'Mengirim...' : 'Kirim Pesan'}
        </Button>
      </div>
    </form>
  );
}
