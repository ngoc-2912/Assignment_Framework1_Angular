import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { UserService } from '../../../services/user.service';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, AfterViewInit {

  @ViewChild('revenueCanvas') revenueCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusCanvas') statusCanvas!: ElementRef<HTMLCanvasElement>;

  isBrowser: boolean;
  viewReady = false;

  totalUsers = 0;
  totalOrders = 0;
  totalRevenue = 0;
  totalProducts = 0;
  orders: any[] = [];      
  allOrders: any[] = [];   
  revenueChart: any;
  statusChart: any;

  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private productService: ProductService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadProducts();
    this.loadOrders();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryRenderCharts();
  }

  tryRenderCharts() {
    if (!this.isBrowser || !this.viewReady || this.orders.length === 0) return;
    setTimeout(() => {
      this.renderRevenueChart();
      this.renderStatusChart();
    }, 0);
  }

  loadUsers() {
    this.userService.list()
      .then((res: any) => {
        this.totalUsers = Array.isArray(res?.data) ? res.data.length : 0;
      })
      .catch(err => {
        console.error('Load users error:', err);
        this.totalUsers = 0;
      });
  }

  loadProducts() {
    this.productService.list()
      .then((res: any) => {
        this.totalProducts = Array.isArray(res?.data) ? res.data.length : 0;
      })
      .catch(err => {
        console.error('Load products error:', err);
        this.totalProducts = 0;
      });
  }

  loadOrders() {
    this.orderService.list()
      .then((res: any) => {
        const raw = Array.isArray(res?.data) ? res.data : [];
        this.allOrders = raw;
        this.orders = raw.filter((o: any) => Number(o?.status) === 2);
        this.totalOrders = this.allOrders.length;
        this.totalRevenue = this.orders.reduce(
          (sum: number, o: any) => sum + Number(o?.total_price || 0), 0
        );
        this.tryRenderCharts();
      })
      .catch(err => {
        console.error('Load orders error:', err);
        this.allOrders = [];
        this.orders = [];
        this.totalOrders = 0;
        this.totalRevenue = 0;
      });
  }

  renderRevenueChart() {
    if (!this.revenueCanvas?.nativeElement) return;

    const sorted = [...this.orders].sort((a,b)=> new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const labels = sorted.map(o => new Date(o.created_at).toLocaleDateString('vi-VN'));
    const data = sorted.map(o => Number(o.total_price || 0));

    if (this.revenueChart) this.revenueChart.destroy();

    this.revenueChart = new Chart(this.revenueCanvas.nativeElement.getContext('2d')!, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.15)',
          fill: true,
          tension: 0.4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  renderStatusChart() {
    if (!this.statusCanvas?.nativeElement) return;

    const counts:any = {};
    this.allOrders.forEach((o: any) => {
      const status = Number(o.status);
      counts[status] = (counts[status] || 0) + 1;
    });

    const statusLabels:any = {
      0: 'Đã huỷ',
      1: 'Chờ xác nhận',
      2: 'Hoàn thành',
      3: 'Đang giao'
    };

    const labels = Object.keys(counts).map(s => statusLabels[s] || `Status ${s}`);
    const data = Object.values(counts);

    if (this.statusChart) this.statusChart.destroy();

    this.statusChart = new Chart(this.statusCanvas.nativeElement.getContext('2d')!, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#ef4444','#f59e0b','#22c55e','#3b82f6']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}