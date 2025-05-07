import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  Delete,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { BannerService } from "./banner.service";
import { diskStorage } from "multer";
import { extname } from "path";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";

@ApiTags("Banner (배너)")
@Controller("banner")
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  @ApiOperation({ summary: "배너 목록 조회" })
  @ApiResponse({ status: 200, description: "배너 목록 반환 성공" })
  async getBanners() {
    return this.bannerService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "특정 배너 조회" })
  @ApiParam({ name: "id", type: Number, description: "배너 ID" })
  @ApiResponse({ status: 200, description: "배너 상세 조회 성공" })
  @ApiResponse({ status: 404, description: "배너를 찾을 수 없음" })
  async getBanner(@Param("id") id: number) {
    try {
      const banner = await this.bannerService.findById(id);
      if (!banner) {
        return { message: `배너 ${id}를 찾을 수 없습니다.` };
      }
      return banner;
    } catch (error) {
      return { message: "배너 조회에 실패했습니다.", error: error.message };
    }
  }

  @Post("register")
  @ApiOperation({ summary: "배너 등록" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "배너 제목" },
        image: {
          type: "string",
          format: "binary",
          description: "배너 이미지 파일",
        },
      },
      required: ["title", "image"],
    },
  })
  @ApiResponse({ status: 201, description: "배너 등록 성공" })
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads/banners",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `banner-${uniqueSuffix}${ext}`);
        },
      }),
    })
  )
  async registerBanner(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title: string }
  ) {
    const imagePath = `/uploads/banners/${file.filename}`;
    const banner = await this.bannerService.create(body.title, imagePath);
    return banner;
  }

  @Delete(":id")
  @ApiOperation({ summary: "배너 삭제" })
  @ApiParam({ name: "id", type: Number, description: "배너 ID" })
  @ApiResponse({ status: 200, description: "배너 삭제 성공" })
  @ApiResponse({ status: 404, description: "배너 삭제 실패 또는 없음" })
  async deleteBanner(@Param("id") id: number) {
    try {
      await this.bannerService.remove(id);
      return { message: "배너가 삭제되었습니다." };
    } catch (error) {
      return { message: "배너 삭제에 실패했습니다.", error: error.message };
    }
  }
}
