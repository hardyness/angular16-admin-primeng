import { Component, ViewChild, HostListener } from '@angular/core';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { HttpHeaders } from '@angular/common/http';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUpload } from 'primeng/fileupload';
import * as CryptoJS from 'crypto-js';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const queryParams = { dt: new Date().toISOString(), web: true };
const queryParamsupdate = {
  dt: new Date().toISOString(),
  web: true,
  ep: 'update',
};

@Component({
  selector: 'app-kategoribarang',
  templateUrl: './kategoribarang.component.html',
  styleUrls: ['./kategoribarang.component.scss'],
})
export class KategoribarangComponent {
  @ViewChild('fileU') fileUpload: FileUpload;
  @ViewChild('vsTable') vsTable: Table;
  @HostListener('window:keydown.control.q', ['$event'])
  bukaDialog(event: KeyboardEvent) {
    event.preventDefault();
    if (this.pageSukses) {
      if (!this.popForm) {
        this.openPop('', 1);
      } else {
        this.popForm = false;
      }
    }
  }
  scrWidth: any;
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrWidth = window.innerWidth;
  }

  //sesi
  sesiidakun: any;
  sesiusername: any;
  sesitoken: any;
  sesinama: any;
  sesiunik: any;

  //data
  isidata: any[] = [];
  total: any;
  totaltampil: any;
  order: any;
  direction: any = true;
  lastOrder: string = '';
  page: any;
  aktifpage: any;
  cari: any = '';
  collectionSize: any;

  tablecolom = [
    {namakolom: 'No.', class: 'w-0.1'},
    {namakolom: 'Gambar', class: 'w-2'},
    {namakolom: 'Kategori Barang', class: 'orderdata', order: 'nama_kategori_barang'},
    {namakolom: 'Jumlah Barang', class: 'orderdata', order: 'jumlahbarang'},
    {namakolom: 'Stok Barang*', class: 'orderdata', order: 'stokpcs'},
    {namakolom: 'Harga Total Barang*', class: 'orderdata', order: 'hargajual'},
  ]

  //form
  formInput: FormGroup;
  namakategoribarang: any;
  idkategori_barang: any;

  //bulk insert
  unselecteddatabulk: any;
  selecteddatabulk: any;
  samedatabulk: any;
  popBulk: boolean = false;

  //loading
  load: any[] = [];
  loadingData: boolean = true;
  pageSukses = false;
  pageGagal = false;
  formGagal = false;
  loadingForm = false;
  loadingButton: boolean;
  loadingHapus: any;

  //event
  popForm: boolean = false;
  namaForm: string;
  unvalid = false;
  getStatistic = false;
  subHtttp: any;
  subRoute: any;

  //form Excel;
  selectedFilexl: File | any = null;
  sheetname = 'datakategoribarang';
  menuexcel: MenuItem[] = [
    {
      icon: "pi pi-folder-open",
      label: 'Import Data',
      command: () => {
        var inputFile = document.getElementById('selectfilexl');
        inputFile.click();
      },
    },
    {
      icon: "pi pi-file-export",
      label: 'Download Template',
      command: () => {
        this.generateFile();
      },
    },
    {
      separator: true,
    },
    {
      icon: 'pi pi-question-circle',
      label: 'Panduan Import',
    },
  ];

  //form gambar wkwkwk
  uploadGambar = [];
  isiGambar: any[] = [];
  selectedFiles: Map<number, File | null> = new Map();
  newImg: Map<number, string | ArrayBuffer | null> = new Map();
  selectedFilesupdate: any[] = [];
  newImgupdate: any[] = [];
  idgambar: any[] = [];

  //test chart awoawkaowkaow
  basicData: any;
  basicOptions: any;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private layoutservice: LayoutService,
    public actRoute: ActivatedRoute,
    public route: Router
  ) {}

  async ngOnInit() {
    this.subRoute = this.actRoute.queryParams.subscribe((params) => {
      if (params['p']) {
        if (isNaN(params['p'])) {
          this.page = 1;
          this.route.navigate([], {
            queryParams: { p: this.page },
            queryParamsHandling: 'merge',
          });
        } else {
          this.page = params['p'];
        }
      } else {
        this.page = 1;
        this.route.navigate([], {
          queryParams: { p: this.page },
          queryParamsHandling: 'merge',
        });
      }
    });
    this.api.setHeader('Kategori Barang');
    this.getScreenSize();

    //form
    this.formInput = this.fb.group({
      namaKategoribarang: ['', [Validators.required]],
    });

    await this.loadStorage();
    const page_s = localStorage.getItem('search_history') || '{}';
    const page_v = JSON.parse(page_s);
    if (page_s !== '{}') {
      this.cari = page_v.cari;
    } else {
      this.cari = '';
    }
    await this.listData();
    this.generateChart();
  }

  ngOnDestroy() {
    this.subRoute.unsubscribe();
    if (this.subHtttp) {
      this.subHtttp.unsubscribe();
    }
  }

  async loadStorage() {
    const sesi = localStorage.getItem(this.api.sesilogin);
    this.decrypt(sesi);
  }

  async decrypt(data: string) {
    const bytes = CryptoJS.AES.decrypt(
      data,
      'wh-AES-secrt-key-ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    );
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    this.sesiidakun = decrypted.idakun;
    this.sesiusername = decrypted.username;
    this.sesitoken = decrypted.token;
    this.sesinama = decrypted.nama;
    return decrypted;
  }

  async listData() {
    this.loadingData = true;
    const param = new FormData();
    param.append('halaman', this.page);
    param.append('cari', this.cari);
    param.append('totaltampil', this.totaltampil);
    param.append('od', this.order);
    param.append('dr', this.direction);

    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });
    try {
      const data: any = this.api.postData(
        param,
        'listkategoribarang/' + this.page,
        { headers },
        queryParams
      );
      const res: any = await lastValueFrom(data);
      if (res.status === 1) {
        this.messageService.add({
          severity: 'error',
          summary: res.pesan,
          detail: 'Akses Anda ditolak!',
        });
        this.auth.logout();
      } else if (res.status === 2) {
        this.messageService.add({
          severity: 'warn',
          summary: res.pesan,
          detail: 'Harap Tunggu!',
        });
        this.page = 1;
        this.route.navigate([], {
          queryParams: { p: this.page },
          queryParamsHandling: 'merge',
        });
        await this.listData();
      } else if (res.status === 99) {
        this.api.setCustomtitle('Barang');
        this.loadingData = false;
        this.pageSukses = true;
        this.total = res.total;
        this.aktifpage = res.start;
        this.totaltampil = res.length;

        const waktusekarang = new Date().getTime();
        res.hasil.forEach((item) => {
          const waktuinsert = new Date(item.waktuinsert).getTime();
          const selisihwaktu = waktusekarang - waktuinsert;
          const selisihmenit = selisihwaktu / (1000 * 60);
          item.selisihwaktu = selisihmenit;
        });
        this.isidata = res.hasil;
      }
    } catch (err) {
      this.loadingData = false;
      if (err.status === 401) {
        this.api.error(err);
        setTimeout(() => {
          this.loadStorage();
          this.listData();
        }, 300);
      } else {
        this.api.error(err);
        this.gagalPost(1, '');
      }
    }
  }

  async tambah(): Promise<boolean> {
    this.loadingButton = true;
    this.unvalid = true;

    if (!this.formInput.valid || this.uploadGambar.length == 0) {
      this.loadingButton = false;
      return false;
    }

    const namaKategoribarang = this.formInput.value.namaKategoribarang
      .replace(/\b\w/g, (char: string) => char.toUpperCase())
      .trim();

    if (this.api.kataKasar(namaKategoribarang)) {
      this.loadingButton = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Text/Prompt Error!',
        detail: 'Data yang anda input mengandung kata-kata yang dilarang.',
      });
      return false;
    }

    const param = new FormData();
    param.append('kategoribarang', namaKategoribarang);
    param.append('gambar', this.uploadGambar[0]);

    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });

    try {
      const data: any = await this.api.postData(
        param,
        'tambahkategoribarang',
        { headers },
        queryParams
      );
      const res: any = await lastValueFrom(data);
      this.loadingButton = false;

      if (res.status === 1) {
        this.messageService.add({
          severity: 'error',
          summary: res.pesan,
          detail: 'Akses Anda ditolak!',
        });
        this.auth.logout();
        return false;
      } else if (res.status === 2 || res.status === 3) {
        this.messageService.add({
          severity: 'error',
          summary: res.pesan,
          detail: 'Coba masukan data lain',
        });
        return false;
      } else if (res.status === 99) {
        this.popForm = false;
        this.messageService.add({
          severity: 'success',
          summary: res.pesan,
          detail: 'Anda berhasil menambah data kategoribarang!',
        });
        this.page = 1;
        await this.listData();
      }
      return true;
    } catch (err) {
      this.loadingButton = false;
      if (err.status === 401) {
        this.api.error(err);
        setTimeout(() => {
          this.loadStorage();
          this.tambah();
        }, 300);
      } else {
        this.api.error(err);
        this.gagalPost(3, '');
      }
      return false;
    } finally {
      this.loadingButton = false;
    }
  }

  async tambahbulk(): Promise<boolean> {
    this.loadingButton = true;
    this.unvalid = true;
    if (this.selecteddatabulk.length == 0){
      this.loadingButton = false;
      return false;
    }
    const param = new FormData();
    param.append('kategoribarang', JSON.stringify(this.selecteddatabulk));
    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });

    try {
      const data: any = await this.api.postData(
        param,
        'tambahkategoribarangbulk',
        { headers },
        queryParams
      );
      const res: any = await lastValueFrom(data);
      this.loadingButton = false;

      if (res.status === 1) {
        this.messageService.add({
          severity: 'error',
          summary: res.pesan,
          detail: 'Akses Anda ditolak!',
        });
        this.auth.logout();
        return false;
      } else if (res.status === 2 || res.status === 3) {
        this.messageService.add({
          severity: 'warn',
          summary: res.pesan,
          detail: 'Coba masukan data lain',
        });
        this.samedatabulk = res.data.map(data => ({kategori: data.kategoribarang}));
        const set = new Set(this.samedatabulk.map(item => item.kategori));
        const filteredArray = this.selecteddatabulk.filter(
          (item) => !set.has(item.kategori)
        );
        this.selecteddatabulk = filteredArray;
        this.unselecteddatabulk = this.samedatabulk;
        return false;
      } else if (res.status === 99) {
        this.popBulk = false;
        this.selecteddatabulk = undefined;
        this.unselecteddatabulk = undefined;
        this.messageService.add({
          severity: 'success',
          summary: res.pesan,
          detail: 'Anda berhasil menambah data kategoribarang!',
        });
        this.page = 1;
        await this.listData();
      }
      return true;
    } catch (err) {
      this.loadingButton = false;
      if (err.status === 401) {
        this.api.error(err);
        setTimeout(() => {
          this.loadStorage();
          this.tambah();
        }, 300);
      } else {
        this.api.error(err);
        this.gagalPost(3, '');
      }
      return false;
    } finally {
      this.loadingButton = false;
    }
  }

  async dataList(id: string): Promise<void> {
    this.loadingForm = true;

    const param = new FormData();
    param.append('idkategori_barang', id);

    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });

    try {
      const data: any = await this.api.postData(
        param,
        'datakategoribarang',
        { headers }
      );
      const res: any = await lastValueFrom(data);
      this.loadingForm = false;

      if (res.status === 1) {
        this.messageService.add({
          severity: 'error',
          summary: res.pesan,
          detail: 'akses data ditolak!',
        });
        this.auth.logout();
      } else if (res.status === 2) {
        this.messageService.add({
          severity: 'error',
          summary: res.pesan,
          detail: 'pastikan data yang diperbaharui sudah benar!',
        });
        this.popForm = false;
      } else if (res.status === 3) {
        this.messageService.add({
          severity: 'error',
          summary: res.pesan,
          detail: 'pastikan data yang diperbaharui sudah benar!',
        });
      } else if (res.status === 99) {
        this.namakategoribarang = res.kategoribarang;
        this.isiGambar = [{ id: 1, nama: res.gambarkategoribarang }];
      }
    } catch (err) {
      this.loadingForm = false;

      if (err.status === 401) {
        this.api.error(err);
        setTimeout(() => {
          this.loadStorage();
          this.dataList(id);
        }, 300);
      } else {
        this.api.error(err);
        this.gagalPost(4, '');
      }
    }
  }

  async perbarui(): Promise<boolean> {
    this.loadingButton = true;
    this.unvalid = true;

    if (!this.formInput.valid) {
      this.loadingButton = false;
      return false;
    }

    const namaKategoribarang: any = this.formInput.value.namaKategoribarang
      .replace(/\b\w/g, (char: string) => char.toUpperCase())
      .trim();

    if (this.api.kataKasar(namaKategoribarang)) {
      this.loadingButton = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Text/Prompt Error!',
        detail: 'Data yang anda input mengandung kata-kata yang dilarang.',
      });
      return false;
    }

    const param = new FormData();
    param.append('idkategoribarang', this.idkategori_barang);
    param.append('kategoribarang', namaKategoribarang);

    if (this.selectedFiles.get(1) !== undefined) {
      param.append('gambar', this.selectedFiles.get(1));
    }

    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });

    try {
      const data = this.api.postData(
        param,
        'updatekategoribarang',
        { headers },
        queryParamsupdate
      );
      const res: any = await lastValueFrom(data);

      this.loadingButton = false;

      if (res.status === 1) {
        this.messageService.add({
          severity: 'error',
          summary: res.pesan,
          detail: 'Akses Anda ditolak!',
        });
        this.auth.logout();
        return false;
      } else if (res.status === 2) {
        this.messageService.add({
          severity: 'error',
          summary: res.pesan,
          detail: 'Pastikan data yang ingin anda akses',
        });
        this.popForm = false;
        return false;
      } else if (res.status === 3 || res.status === 4) {
        this.messageService.add({
          severity: 'warn',
          summary: res.pesan,
          detail: 'Opps, cobalah ketik data yang lain',
        });
        return false;
      } else if (res.status === 99) {
        this.messageService.add({
          severity: 'success',
          summary: res.pesan,
          detail: 'Anda berhasil merubah data di kategoribarang!',
        });
        this.popForm = false;
        await this.listData();
      }
      return true;
    } catch (err) {
      this.loadingButton = false;

      if (err.status === 401) {
        this.api.error(err);
        setTimeout(() => {
          this.loadStorage();
          this.perbarui();
        }, 300);
      } else {
        this.api.error(err);
        this.gagalPost(5, '');
      }
      return false;
    } finally {
      this.loadingButton = false;
    }
  }

  async hapusData(id: string): Promise<void> {
    this.loadingHapus = id;

    const param = new FormData();
    param.append('idkategoribarang', id);

    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });

    try {
      const data = this.api.postData(
        param,
        'hapuskategoribarang',
        { headers },
        queryParams
      );
      const res: any = await lastValueFrom(data);

      this.loadingHapus = false;

      if (res.status === 1) {
        this.messageService.add({
          severity: 'error',
          summary: res.pesan,
          detail: 'Akses Anda ditolak!',
        });
        this.auth.logout();
      } else if (res.status === 2) {
        this.messageService.add({
          severity: 'error',
          summary: res.pesan,
          detail: 'Pastikan data yang ingin anda akses',
        });
      } else if (res.status === 99) {
        this.messageService.add({
          severity: 'success',
          summary: res.pesan,
          detail: 'Anda berhasil menghapus data!',
        });
        await this.listData();
      }
    } catch (err) {
      this.loadingHapus = false;

      if (err.status === 401) {
        this.api.error(err);
        setTimeout(() => {
          this.loadStorage();
          this.hapusData(id);
        }, 300);
      } else {
        this.api.error(err);
      }
    }
  }

  async konfirmHapus(id, target) {
    this.idkategori_barang = id.idkategoribarang;
    this.confirmationService.confirm({
      target: target,
      message: 'yakin ingin menghapus ' + id.kategoribarang + '?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      dismissableMask: true,
      key: id.idkategoribarang,
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.hapusData(id.idkategoribarang);
      },
      reject: () => {},
    });
  }

  //form
  async formKosong() {
    this.formInput.get('namaKategoribarang').reset();
    this.uploadGambar = [];
    if (this.fileUpload !== undefined) {
      this.fileUpload.clear();
    }
    if (this.selectedFiles.get(1) !== undefined) {
      this.selectedFiles.delete(1);
    }
  }

  //event

  async orderData(p) {
    let currentOrder = '';
    currentOrder = p;
    if (this.lastOrder === currentOrder) {
      this.direction = !this.direction;
    } else {
      this.direction = true;
    }
    this.lastOrder = currentOrder;
    this.order = currentOrder;
    this.listData();
}

  async gagalPost(tipe, id) {
    var gagal = [
      {
        tipe: tipe,
        id: id,
      },
    ];
    this.loadStorage();
    this.load = gagal;
    if (tipe == 1) {
      this.pageGagal = true;
      this.pageSukses = false;
    } else if (tipe == 2 || tipe == 3 || tipe == 4 || tipe == 5) {
      this.formGagal = true;
    }
  }

  async reload(param, id) {
    if (param == 1) {
      this.pageGagal = false;
      this.listData();
    } else if (param == 3) {
      this.formGagal = false;
      this.tambah();
    } else if (param == 4) {
      this.formGagal = false;
      this.dataList(this.idkategori_barang);
    } else if (param == 5) {
      this.formGagal = false;
      this.perbarui();
    }
  }

  async refresh() {
    this.page = 1;
    this.cari = '';
    this.totaltampil = undefined;
    this.order = undefined;
    this.lastOrder = '';
    this.direction = true;
    this.route.navigate([], {
      queryParams: { p: this.page },
      queryParamsHandling: 'merge',
    });
    this.listData();
  }

  async openPop(p1, p2) {
    if (p2 == 1) {
      this.popForm = true;
      this.namaForm = 'Tambah Kategori Barang';
    } else if (p2 == 2) {
      this.dataList(p1.idkategoribarang);
      this.popForm = true;
      this.namaForm = 'Perbarui Data Kategori Barang';
      this.idkategori_barang = p1.idkategoribarang;
    }
  }

  async emitsearch() {
    var dataPage = {
      cari: this.cari,
    };
    if (this.cari !== '' || undefined) {
      this.page = 1;
      this.route.navigate([], {
        queryParams: { p: this.page },
        queryParamsHandling: 'merge',
      });
      this.listData();
      await localStorage.setItem(
        'search_history',
        JSON.stringify(dataPage)
      );
    } else {
      this.cari = '';
      localStorage.removeItem('search_history');
    }
  }

  async search(e) {
    this.cari = e;
    if (this.cari === '' || undefined) {
      const page_s = localStorage.getItem('search_history');
      const page_v = JSON.parse(page_s);
      if (page_v !== null) {
        this.page = 1;
        this.route.navigate([], {
          queryParams: { p: this.page },
          queryParamsHandling: 'merge',
        });
        this.listData();
        localStorage.removeItem('search_history');
      } else {
        this.cari = '';
      }
    }
  }

  async pageChange(e) {
    if (e.page + 1 !== this.page) {
      this.page = e.page + 1;
      this.totaltampil = e.rows;
      this.route.navigate([], {
        queryParams: { p: this.page },
        queryParamsHandling: 'merge',
      });
      this.listData();
    }
  }

  //FILE EXCEL
  async openFile(e) {
    this.selectedFilexl = e.target.files[0];
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      if (jsonData[this.sheetname]) {
        const dataSheet = jsonData[this.sheetname].map((item) => ({
          kategori: item['KATEGORI BARANG'],
        }));
        const categories = dataSheet.map(item => item.kategori);
        const categorySet = new Set();
        const duplicates = new Set();
        categories.forEach(category => {
          if (categorySet.has(category)) {
            duplicates.add(category);
          } else {
            categorySet.add(category);
          }
        });
        if (duplicates.size > 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Duplikasi Ditemukan',
            detail: `Kategori barang yang terduplikasi: ${Array.from(duplicates).join(', ')}.`,
          });
        } else if (dataSheet.length == 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Data Kosong',
            detail: 'File yang Anda pilih tidak memiliki data.',
          });
        } else {
          this.selecteddatabulk = dataSheet;
          this.unselecteddatabulk = [];
          this.popBulk = true;
        }
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'File tidak dapat terbaca',
          detail: 'Coba download template excel terlebih dahulu dan lakukan pengecekan data.',
        });
      }
    };
    reader.readAsArrayBuffer(this.selectedFilexl);
  }

  async generateFile() {
    var datadummy = [{ NO: 1, 'KATEGORI BARANG': 'Tulis Nama Kategori' }];
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datadummy, {
      header: ['NO', 'KATEGORI BARANG'],
    });
    const workbook: XLSX.WorkBook = {
      Sheets: { [this.sheetname]: worksheet },
      SheetNames: [this.sheetname],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, this.sheetname);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, `${fileName}_template_${new Date().getTime()}.xlsx`);
  }

  //FILE GAMBAR

  async imgTambah(e) {
    this.uploadGambar = e.currentFiles;
  }

  async imgBaru(event: any, idgambar: number) {
    const fileInput: HTMLInputElement = event.target;
    if (fileInput.files && fileInput.files.length > 0) {
      const selectedFile: File = fileInput.files[0];
      this.selectedFiles.set(idgambar, selectedFile);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newImg.set(idgambar, e.target.result);
      };
      reader.readAsDataURL(selectedFile);
      if (selectedFile && !this.idgambar.includes(idgambar)) {
        this.idgambar.push(idgambar);
      }
    }
  }

  async removeFile(file: File, uploader: FileUpload) {
    const indexFile = uploader.files.indexOf(file);
    uploader.remove(event, indexFile);
  }

  async removeFileisi(i) {
    if (this.selectedFiles.get(1) !== undefined) {
      this.selectedFiles.delete(1);
    }
  }

  async openChart() {
    this.getStatistic = !this.getStatistic;
  }

  async generateChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder =
      documentStyle.getPropertyValue('--surface-border');

    this.basicData = {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Sales',
          data: [540, 325, 702, 620],
          backgroundColor: [
            'rgba(255, 159, 64, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
          ],
          borderColor: [
            'rgb(255, 159, 64)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
          ],
          borderWidth: 1,
        },
      ],
    };

    this.basicOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }
}
