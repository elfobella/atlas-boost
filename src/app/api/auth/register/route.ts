import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Tüm alanlar zorunludur" },
        { status: 400 }
      );
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Geçerli bir email adresi giriniz" },
        { status: 400 }
      );
    }

    // Şifre uzunluğunu kontrol et
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Şifre en az 6 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // Email'in zaten kullanılıp kullanılmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Yeni kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });

    // Şifreyi response'dan çıkar
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "Kullanıcı başarıyla oluşturuldu", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json(
      { message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
