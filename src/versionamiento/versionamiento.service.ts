import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVersionamientoDto } from './dto/create-versionamiento.dto';
import { UpdateVersionamientoDto } from './dto/update-versionamiento.dto';
import { Versionamiento } from './entities/versionamiento.entity';

@Injectable()
export class VersionamientoService {

    constructor(@InjectRepository(Versionamiento) private versionRepository: Repository<Versionamiento>){}

    async createVersion(createVersionamientoDto: CreateVersionamientoDto) {

      const newVersion = await this.versionRepository.create(createVersionamientoDto);
      return this.versionRepository.save(newVersion);
    }

   async findAllVersion() {
      return this.versionRepository.find();
    }


  async updateVersion(id_version: number, dto: UpdateVersionamientoDto) {
    const versionFound = await this.versionRepository.findOne({ where: { id_version } });
    if (!versionFound)
      throw new HttpException('Versión no encontrada', HttpStatus.NOT_FOUND);

    // ✅ Asegurarse de no tocar num_version ni createdAt
    const camposPermitidos = [
      'ofi_desp_pt',
      'fech_desp_pt',
      'oficioenviodmi',
      'fechaenvioreq',
      'obs_version',
    ];

    for (const campo of camposPermitidos) {
      if (dto[campo] !== undefined) {
        versionFound[campo] = dto[campo];
      }
    }

    versionFound.updatedAt = new Date(); // ✅ actualiza solo timestamp

    return await this.versionRepository.save(versionFound);
  }



    async removeVersion(id_version: number) {
     const versionFound = await this.versionRepository.findOne({ where: { id_version: id_version } });
      if(!versionFound)
        return new HttpException('Version no encontrada', HttpStatus.NOT_FOUND);
      else {
        return this.versionRepository.delete([{ id_version: id_version }]);
      }
    }
}
