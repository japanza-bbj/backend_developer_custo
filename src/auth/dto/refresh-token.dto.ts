import { IsNotEmpty, IsString } from "class-validator";
export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty({ message: 'กรุณาระบุ refresh_token' })
    refresh_token: string;
}