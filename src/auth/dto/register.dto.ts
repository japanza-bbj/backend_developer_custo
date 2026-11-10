import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
    @IsNotEmpty({ message: 'กรุณากรอกอีเมล'})
    email: string;

    @IsString()
    @MinLength(6, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'})
    @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกชื่อ' })
    fullName: string;
}