import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { CreateBookDto, UpdateBookDto, IssueBookDto, ReturnBookDto, BookQueryDto } from './dto/library.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('library')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('books')
  @ApiOperation({ summary: 'Search book catalog' })
  getBooks(@Query() query: BookQueryDto, @CurrentUser('institutionId') iid: string) {
    return this.libraryService.getBooks(query, iid);
  }

  @Post('books')
  @Roles('LIBRARIAN', 'INSTITUTION_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Add a book to catalog' })
  createBook(@Body() dto: CreateBookDto, @CurrentUser('institutionId') iid: string) {
    return this.libraryService.createBook(dto, iid);
  }

  @Put('books/:id')
  @Roles('LIBRARIAN', 'INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Update book details' })
  updateBook(@Param('id') id: string, @Body() dto: UpdateBookDto, @CurrentUser('institutionId') iid: string) {
    return this.libraryService.updateBook(id, dto, iid);
  }

  @Delete('books/:id')
  @Roles('LIBRARIAN', 'INSTITUTION_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a book' })
  deleteBook(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.libraryService.deleteBook(id, iid);
  }

  @Post('issue')
  @Roles('LIBRARIAN', 'INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Issue a book to a student' })
  issueBook(@Body() dto: IssueBookDto, @CurrentUser('id') issuedById: string, @CurrentUser('institutionId') iid: string) {
    return this.libraryService.issueBook(dto, issuedById, iid);
  }

  @Post('return')
  @Roles('LIBRARIAN', 'INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Return a book and calculate fine' })
  returnBook(@Body() dto: ReturnBookDto, @CurrentUser('id') returnedById: string) {
    return this.libraryService.returnBook(dto, returnedById);
  }

  @Get('issued/:studentId')
  @Roles('STUDENT', 'PARENT', 'LIBRARIAN', 'INSTITUTION_ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY')
  @ApiOperation({ summary: 'Get currently issued books for a student' })
  getIssuedBooks(@Param('studentId') studentId: string, @CurrentUser() user: any) {
    return this.libraryService.getIssuedBooks(studentId, user);
  }

  @Get('history')
  @Roles('LIBRARIAN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Get full issue/return history' })
  getHistory(@CurrentUser('institutionId') iid: string, @Query('studentId') studentId?: string) {
    return this.libraryService.getIssueHistory(studentId, iid);
  }
}
