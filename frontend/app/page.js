'use client';

import { useEffect } from 'react';
import flatpickr from 'flatpickr';
import { Chart, registerables } from 'chart.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

Chart.register(...registerables);

const htmlContent = `
<div id="loadingOverlay" class="fixed inset-0 z-[100] bg-paper flex flex-col items-center justify-center gap-3">
  <div class="w-10 h-10 border-[3px] border-teal-200 border-t-teal-700 rounded-full animate-spin"></div>
  <p class="text-sm text-inksoft font-medium">Memuat data kamu...</p>
</div>

<div id="app" class="min-h-screen">

  <!-- ============ TOP BAR ============ -->
  <header class="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-line">
    <div class="flex items-center justify-between gap-3 px-4 md:px-6 h-16">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div class="hidden sm:block leading-tight">
          <p class="font-display font-bold text-[15px] text-ink">CashMoneyManagement</p>
          <p class="text-[11px] text-inksoft -mt-0.5">Cashflow harian → mingguan → bulanan</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button id="rangeBtn" class="flex items-center gap-2 border border-line rounded-xl px-3 h-10 text-sm bg-white hover:border-teal-400 transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16594A" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
          <span id="rangeLabel" class="font-mono text-[12.5px] text-ink whitespace-nowrap"></span>
        </button>
        <input id="rangeInput" class="hidden" />

        <div class="relative">
          <button id="alertBell" class="relative w-10 h-10 rounded-xl border border-line bg-white flex items-center justify-center hover:border-amber-400 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B5A55" stroke-width="2" stroke-linecap="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
            <span id="alertDot" class="hidden absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rust-500 text-white text-[10px] font-bold items-center justify-center">0</span>
          </button>
          <div id="alertDropdown" class="hidden absolute right-0 top-[calc(100%+8px)] w-80 max-w-[88vw] bg-white rounded-2xl border border-line shadow-lg z-40 max-h-[70vh] overflow-hidden flex flex-col">
            <div class="px-4 py-3 border-b border-line flex items-center justify-between shrink-0">
              <p class="font-display font-semibold text-[13.5px]">Tagihan Belum Dibayar</p>
              <span id="alertDropdownCount" class="text-[11px] font-semibold bg-rust-50 text-rust-600 rounded-full px-2 py-0.5">0</span>
            </div>
            <div id="alertDropdownList" class="overflow-y-auto p-2 space-y-1.5"></div>
          </div>
        </div>

        <button id="quickAddBtn" class="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 transition text-white rounded-xl px-3.5 h-10 text-sm font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <span class="hidden sm:inline">Tambah</span>
        </button>
      </div>
    </div>

    <!-- alert banner -->
    <div id="alertBanner" class="hidden border-t border-amber-200 bg-amber-50 px-4 md:px-6 py-2 text-[13px] text-amber-700 flex items-center gap-2 cursor-pointer">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B87511" stroke-width="2.3"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
      <span id="alertBannerText"></span>
      <span class="ml-auto underline font-medium shrink-0">Lihat detail</span>
    </div>
  </header>

  <div class="flex">
    <!-- ============ SIDEBAR (desktop) ============ -->
    <nav class="hidden md:flex flex-col w-60 shrink-0 border-r border-line bg-white min-h-[calc(100vh-64px)] px-3 py-5 gap-1">
      <a href="/dashboard" data-view="dashboard" class="nav-link active flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-teal-50 transition">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#101A17" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
        Dashboard
      </a>
      <a href="/expenses" data-view="expenses" class="nav-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-teal-50 transition">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#101A17" stroke-width="2"><path d="M3 10h18M7 15h4"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg>
        Pengeluaran
      </a>
      <a href="/incomes" data-view="incomes" class="nav-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-teal-50 transition">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#101A17" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        Pemasukan
      </a>
      <a href="/allocations" data-view="allocations" class="nav-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-teal-50 transition">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#101A17" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l7 7"/></svg>
        Dana Alokasi
      </a>
      <a href="/reports" data-view="reports" class="nav-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-teal-50 transition">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#101A17" stroke-width="2"><path d="M8 17V9M13 17V5M18 17v-5"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
        Laporan
      </a>

      <div class="mt-auto pt-4 border-t border-line">
        <p class="text-[11px] text-inksoft px-3.5 leading-relaxed">Data tersimpan otomatis untuk sesi Claude ini.</p>
      </div>
    </nav>

    <!-- ============ MAIN ============ -->
    <main class="flex-1 min-w-0 px-4 md:px-6 py-5 pb-28 md:pb-8">

      <!-- ---------- DASHBOARD ---------- -->
      <section id="view-dashboard" class="view active space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-display text-xl font-bold text-ink">Dashboard</h1>
            <p id="dashPeriodLabel" class="text-[13px] text-inksoft"></p>
          </div>
        </div>

        <!-- summary cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="bg-surface rounded-2xl shadow-card border border-line p-4">
            <p class="text-[12px] text-inksoft font-medium">Pemasukan</p>
            <p id="sumIncome" class="font-mono font-bold text-lg text-teal-700 mt-1">Rp 0</p>
          </div>
          <div class="bg-surface rounded-2xl shadow-card border border-line p-4">
            <p class="text-[12px] text-inksoft font-medium">Pengeluaran</p>
            <p id="sumExpense" class="font-mono font-bold text-lg text-rust-600 mt-1">Rp 0</p>
          </div>
          <div class="bg-surface rounded-2xl shadow-card border border-line p-4">
            <p class="text-[12px] text-inksoft font-medium">Alokasi Dana</p>
            <p id="sumAllocation" class="font-mono font-bold text-lg text-amber-600 mt-1">Rp 0</p>
          </div>
          <div id="sumBalanceCard" class="rounded-2xl shadow-card border p-4 bg-teal-700 border-teal-700">
            <p class="text-[12px] text-teal-100 font-medium flex items-center gap-1">Saldo Bersih <span id="balanceBadge" class="text-[10px] bg-white/20 rounded-full px-1.5 py-0.5">SURPLUS</span></p>
            <p id="sumBalance" class="font-mono font-bold text-lg text-white mt-1">Rp 0</p>
          </div>
        </div>

        <!-- cascade -->
        <div class="bg-surface rounded-2xl shadow-card border border-line p-4 md:p-5">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h2 class="font-display font-semibold text-[15px]">Alur Pengeluaran: Harian → Mingguan → Bulanan</h2>
              <p class="text-[12px] text-inksoft">Total harian dijumlah tiap hari Minggu (mingguan), lalu tiap minggu terakhir bulan dijumlah jadi total bulanan.</p>
            </div>
          </div>
          <div id="cascadeWrap" class="overflow-x-auto pb-1"></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="bg-surface rounded-2xl shadow-card border border-line p-4 lg:col-span-2">
            <h2 class="font-display font-semibold text-[15px] mb-3">Tren Cashflow Mingguan</h2>
            <div class="h-64"><canvas id="chartTrend"></canvas></div>
          </div>
          <div class="bg-surface rounded-2xl shadow-card border border-line p-4">
            <h2 class="font-display font-semibold text-[15px] mb-3">Komposisi Pengeluaran</h2>
            <div class="h-64"><canvas id="chartExpenseDonut"></canvas></div>
          </div>
        </div>

        <!-- unpaid bills -->
        <div class="bg-surface rounded-2xl shadow-card border border-line p-4">
          <h2 class="font-display font-semibold text-[15px] mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B87511" stroke-width="2.3"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
            Tagihan Belum Terbayar
          </h2>
          <div id="unpaidList" class="space-y-2"></div>
        </div>
      </section>

      <!-- ---------- EXPENSES ---------- -->
      <section id="view-expenses" class="view space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="font-display text-xl font-bold text-ink">Pengeluaran</h1>
            <p class="text-[13px] text-inksoft">Tetap, Berkala, dan Dinamis / Variabel</p>
          </div>
          <button data-add="expense" class="bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-xl px-4 h-10">+ Catat Pengeluaran</button>
        </div>

        <div class="flex flex-wrap gap-2" id="expenseCatTabs">
          <button data-cat="all" class="tab-pill active px-3.5 h-9 rounded-full text-[13px] font-medium border border-line bg-white">Semua</button>
          <button data-cat="tetap" class="tab-pill px-3.5 h-9 rounded-full text-[13px] font-medium border border-line bg-white">Tetap</button>
          <button data-cat="berkala" class="tab-pill px-3.5 h-9 rounded-full text-[13px] font-medium border border-line bg-white">Berkala</button>
          <button data-cat="dinamis" class="tab-pill px-3.5 h-9 rounded-full text-[13px] font-medium border border-line bg-white">Dinamis / Variabel</button>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="bg-surface rounded-xl border border-line p-3"><p class="text-[11px] text-inksoft">Tetap</p><p id="totTetap" class="font-mono font-bold text-teal-700">Rp 0</p></div>
          <div class="bg-surface rounded-xl border border-line p-3"><p class="text-[11px] text-inksoft">Berkala</p><p id="totBerkala" class="font-mono font-bold text-amber-600">Rp 0</p></div>
          <div class="bg-surface rounded-xl border border-line p-3"><p class="text-[11px] text-inksoft">Dinamis</p><p id="totDinamis" class="font-mono font-bold text-rust-600">Rp 0</p></div>
        </div>

        <div id="expenseList" class="space-y-2"></div>
      </section>

      <!-- ---------- INCOMES ---------- -->
      <section id="view-incomes" class="view space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="font-display text-xl font-bold text-ink">Pemasukan</h1>
            <p class="text-[13px] text-inksoft">Earned, Passive, dan Portfolio/Investment Income</p>
          </div>
          <button data-add="income" class="bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-xl px-4 h-10">+ Catat Pemasukan</button>
        </div>

        <div class="flex flex-wrap gap-2" id="incomeCatTabs">
          <button data-cat="all" class="tab-pill active px-3.5 h-9 rounded-full text-[13px] font-medium border border-line bg-white">Semua</button>
          <button data-cat="earned" class="tab-pill px-3.5 h-9 rounded-full text-[13px] font-medium border border-line bg-white">Earned / Active</button>
          <button data-cat="passive" class="tab-pill px-3.5 h-9 rounded-full text-[13px] font-medium border border-line bg-white">Passive</button>
          <button data-cat="portfolio" class="tab-pill px-3.5 h-9 rounded-full text-[13px] font-medium border border-line bg-white">Portfolio / Investment</button>
        </div>

        <div id="incomeList" class="space-y-2"></div>
      </section>

      <!-- ---------- ALLOCATIONS ---------- -->
      <section id="view-allocations" class="view space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="font-display text-xl font-bold text-ink">Dana Alokasi</h1>
            <p class="text-[13px] text-inksoft">Darurat, Asuransi, Investasi, dan Cadangan/Likuiditas</p>
          </div>
          <button data-add="allocation" class="bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-xl px-4 h-10">+ Catat Alokasi</button>
        </div>

        <div id="allocationCards" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"></div>
        <div id="allocationList" class="space-y-2"></div>
      </section>

      <!-- ---------- REPORTS ---------- -->
      <section id="view-reports" class="view space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="font-display text-xl font-bold text-ink">Laporan</h1>
            <p class="text-[13px] text-inksoft">Ringkasan interaktif untuk periode yang dipilih — bisa diekspor ke PDF.</p>
          </div>
          <button id="exportPdfBtn" class="flex items-center gap-2 bg-rust-500 hover:bg-rust-600 text-white text-sm font-semibold rounded-xl px-4 h-10">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3"><path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
            Export PDF
          </button>
        </div>

        <div id="reportContent" class="bg-surface rounded-2xl shadow-card border border-line p-5 md:p-7 space-y-6">
          <div class="flex items-center justify-between border-b border-line pb-4">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div>
                <p class="font-display font-bold text-ink">CashMoneyManagement</p>
                <p class="text-[12px] text-inksoft">Laporan Keuangan Pribadi</p>
              </div>
            </div>
            <p id="reportPeriod" class="font-mono text-[12.5px] text-inksoft text-right"></p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="rounded-xl border border-line p-3"><p class="text-[11px] text-inksoft">Total Pemasukan</p><p id="repIncome" class="font-mono font-bold text-teal-700">Rp 0</p></div>
            <div class="rounded-xl border border-line p-3"><p class="text-[11px] text-inksoft">Total Pengeluaran</p><p id="repExpense" class="font-mono font-bold text-rust-600">Rp 0</p></div>
            <div class="rounded-xl border border-line p-3"><p class="text-[11px] text-inksoft">Total Alokasi</p><p id="repAllocation" class="font-mono font-bold text-amber-600">Rp 0</p></div>
            <div class="rounded-xl border border-line p-3 bg-teal-700"><p class="text-[11px] text-teal-100">Saldo Akhir</p><p id="repBalance" class="font-mono font-bold text-white">Rp 0</p></div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <h3 class="font-display font-semibold text-[14px] mb-2">Pengeluaran per Kategori</h3>
              <div class="h-56"><canvas id="chartRepExpense"></canvas></div>
            </div>
            <div>
              <h3 class="font-display font-semibold text-[14px] mb-2">Pemasukan per Kategori</h3>
              <div class="h-56"><canvas id="chartRepIncome"></canvas></div>
            </div>
          </div>

          <div>
            <h3 class="font-display font-semibold text-[14px] mb-2">Tren Bulanan (6 Bulan Terakhir)</h3>
            <div class="h-64"><canvas id="chartRepTrend"></canvas></div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div>
              <h3 class="font-display font-semibold text-[14px] mb-2">Rincian Pengeluaran</h3>
              <table class="w-full text-[12.5px]"><tbody id="repExpenseTable"></tbody></table>
            </div>
            <div>
              <h3 class="font-display font-semibold text-[14px] mb-2">Rincian Pemasukan</h3>
              <table class="w-full text-[12.5px]"><tbody id="repIncomeTable"></tbody></table>
            </div>
            <div>
              <h3 class="font-display font-semibold text-[14px] mb-2">Rincian Alokasi Dana</h3>
              <table class="w-full text-[12.5px]"><tbody id="repAllocationTable"></tbody></table>
            </div>
          </div>

          <div class="rounded-xl bg-teal-50 border border-teal-100 p-4">
            <h3 class="font-display font-semibold text-[14px] mb-2 text-teal-800">Ringkasan & Saran</h3>
            <ul id="repSuggestions" class="space-y-1.5 text-[13px] text-teal-800 list-disc list-inside"></ul>
          </div>
        </div>
      </section>

    </main>
  </div>

  <!-- ============ MOBILE BOTTOM NAV ============ -->
  <nav class="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-line flex items-stretch h-16 px-1">
    <a href="/dashboard" data-view="dashboard" class="nav-link-mobile active flex-1 flex flex-col items-center justify-center gap-0.5 text-inksoft">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
      <span class="text-[10px] font-medium">Dashboard</span>
    </a>
    <a href="/expenses" data-view="expenses" class="nav-link-mobile flex-1 flex flex-col items-center justify-center gap-0.5 text-inksoft">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h18M7 15h4"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg>
      <span class="text-[10px] font-medium">Keluar</span>
    </a>
    <a href="/incomes" data-view="incomes" class="nav-link-mobile flex-1 flex flex-col items-center justify-center gap-0.5 text-inksoft">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
      <span class="text-[10px] font-medium">Masuk</span>
    </a>
    <a href="/allocations" data-view="allocations" class="nav-link-mobile flex-1 flex flex-col items-center justify-center gap-0.5 text-inksoft">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l7 7"/></svg>
      <span class="text-[10px] font-medium">Alokasi</span>
    </a>
    <a href="/reports" data-view="reports" class="nav-link-mobile flex-1 flex flex-col items-center justify-center gap-0.5 text-inksoft">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 17V9M13 17V5M18 17v-5"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
      <span class="text-[10px] font-medium">Laporan</span>
    </a>
  </nav>
</div>

<!-- ============ QUICK ADD CHOOSER ============ -->
<div id="quickAddModal" class="modal-backdrop fixed inset-0 bg-ink/40 z-40 items-end md:items-center justify-center">
  <div class="bg-white rounded-t-2xl md:rounded-2xl w-full md:w-80 p-4 space-y-2">
    <p class="font-display font-semibold text-sm px-1 pb-1">Mau catat apa?</p>
    <button data-add="expense" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rust-50 text-left">
      <span class="w-9 h-9 rounded-lg bg-rust-50 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8471F" stroke-width="2.3"><path d="M5 12h14"/></svg></span>
      <span><span class="block text-sm font-semibold">Pengeluaran</span><span class="block text-[12px] text-inksoft">Tetap, berkala, atau dinamis</span></span>
    </button>
    <button data-add="income" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-teal-50 text-left">
      <span class="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F6F5C" stroke-width="2.3"><path d="M12 19V5M5 12l7-7 7 7"/></svg></span>
      <span><span class="block text-sm font-semibold">Pemasukan</span><span class="block text-[12px] text-inksoft">Earned, passive, atau investment</span></span>
    </button>
    <button data-add="allocation" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 text-left">
      <span class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B87511" stroke-width="2.3"><path d="M12 2v20"/></svg></span>
      <span><span class="block text-sm font-semibold">Dana Alokasi</span><span class="block text-[12px] text-inksoft">Darurat, asuransi, investasi, cadangan</span></span>
    </button>
    <button id="quickAddCancel" class="w-full text-center py-2.5 text-sm font-medium text-inksoft">Batal</button>
  </div>
</div>

<!-- ============ EXPENSE FORM MODAL ============ -->
<div id="expenseModal" class="modal-backdrop fixed inset-0 bg-ink/40 z-40 items-end md:items-center justify-center overflow-y-auto py-6">
  <form id="expenseForm" class="bg-white rounded-t-2xl md:rounded-2xl w-full md:w-[440px] p-5 space-y-3.5 max-h-[92vh] overflow-y-auto">
    <div class="flex items-center justify-between">
      <h3 class="font-display font-bold text-[15px]">Catat Pengeluaran</h3>
      <button type="button" class="modal-close text-inksoft text-xl leading-none">&times;</button>
    </div>
    <input type="hidden" id="exp_id" />
    <div>
      <label class="text-[12.5px] font-medium text-inksoft">Jenis Pengeluaran</label>
      <select id="exp_category" class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm bg-white">
        <option value="tetap">Tetap (rutin, jumlah konstan)</option>
        <option value="berkala">Berkala (di luar siklus bulanan)</option>
        <option value="dinamis">Dinamis / Variabel</option>
      </select>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-[12.5px] font-medium text-inksoft">Kategori</label>
        <input id="exp_sub" list="exp_sub_list" class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm" placeholder="Pilih / ketik" />
        <datalist id="exp_sub_list"></datalist>
      </div>
      <div>
        <label class="text-[12.5px] font-medium text-inksoft">Frekuensi</label>
        <select id="exp_freq" class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm bg-white"></select>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-[12.5px] font-medium text-inksoft">Jumlah (Rp)</label>
        <input id="exp_amount" type="number" min="0" step="1" required class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm font-mono" placeholder="0" />
      </div>
      <div>
        <label class="text-[12.5px] font-medium text-inksoft">Tanggal</label>
        <input id="exp_date" type="date" required class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm" />
      </div>
    </div>
    <div id="exp_status_wrap" class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-[12.5px] font-medium text-inksoft">Status Bayar</label>
        <select id="exp_status" class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm bg-white">
          <option value="unpaid">Belum Dibayar</option>
          <option value="paid">Sudah Dibayar</option>
        </select>
      </div>
      <div class="flex items-end pb-2.5">
        <label class="flex items-center gap-2 text-[12.5px] text-inksoft">
          <input id="exp_estimate" type="checkbox" class="w-4 h-4 rounded border-line accent-teal-700" />
          Ini estimasi (belum aktual)
        </label>
      </div>
    </div>
    <div>
      <label class="text-[12.5px] font-medium text-inksoft">Catatan (opsional)</label>
      <input id="exp_note" class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm" placeholder="mis. bayar via transfer BCA" />
    </div>
    <div class="flex gap-2 pt-1">
      <button type="button" id="exp_delete" class="hidden text-rust-600 text-sm font-semibold px-4 h-11 rounded-xl border border-rust-200">Hapus</button>
      <button type="submit" class="flex-1 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-xl h-11">Simpan</button>
    </div>
  </form>
</div>

<!-- ============ INCOME FORM MODAL ============ -->
<div id="incomeModal" class="modal-backdrop fixed inset-0 bg-ink/40 z-40 items-end md:items-center justify-center overflow-y-auto py-6">
  <form id="incomeForm" class="bg-white rounded-t-2xl md:rounded-2xl w-full md:w-[440px] p-5 space-y-3.5 max-h-[92vh] overflow-y-auto">
    <div class="flex items-center justify-between">
      <h3 class="font-display font-bold text-[15px]">Catat Pemasukan</h3>
      <button type="button" class="modal-close text-inksoft text-xl leading-none">&times;</button>
    </div>
    <input type="hidden" id="inc_id" />
    <div>
      <label class="text-[12.5px] font-medium text-inksoft">Jenis Pemasukan</label>
      <select id="inc_category" class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm bg-white">
        <option value="earned">Earned / Active Income</option>
        <option value="passive">Passive Income</option>
        <option value="portfolio">Portfolio / Investment Income</option>
      </select>
    </div>
    <div>
      <label class="text-[12.5px] font-medium text-inksoft">Kategori</label>
      <input id="inc_sub" list="inc_sub_list" class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm" placeholder="Pilih / ketik" />
      <datalist id="inc_sub_list"></datalist>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-[12.5px] font-medium text-inksoft">Jumlah (Rp)</label>
        <input id="inc_amount" type="number" min="0" step="1" required class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm font-mono" placeholder="0" />
      </div>
      <div>
        <label class="text-[12.5px] font-medium text-inksoft">Tanggal</label>
        <input id="inc_date" type="date" required class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm" />
      </div>
    </div>
    <div>
      <label class="text-[12.5px] font-medium text-inksoft">Catatan (opsional)</label>
      <input id="inc_note" class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm" />
    </div>
    <div class="flex gap-2 pt-1">
      <button type="button" id="inc_delete" class="hidden text-rust-600 text-sm font-semibold px-4 h-11 rounded-xl border border-rust-200">Hapus</button>
      <button type="submit" class="flex-1 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-xl h-11">Simpan</button>
    </div>
  </form>
</div>

<!-- ============ ALLOCATION FORM MODAL ============ -->
<div id="allocationModal" class="modal-backdrop fixed inset-0 bg-ink/40 z-40 items-end md:items-center justify-center overflow-y-auto py-6">
  <form id="allocationForm" class="bg-white rounded-t-2xl md:rounded-2xl w-full md:w-[440px] p-5 space-y-3.5 max-h-[92vh] overflow-y-auto">
    <div class="flex items-center justify-between">
      <h3 class="font-display font-bold text-[15px]">Catat Dana Alokasi</h3>
      <button type="button" class="modal-close text-inksoft text-xl leading-none">&times;</button>
    </div>
    <input type="hidden" id="alc_id" />
    <div>
      <label class="text-[12.5px] font-medium text-inksoft">Jenis Alokasi</label>
      <select id="alc_category" class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm bg-white">
        <option value="darurat">Dana Darurat (Emergency Fund)</option>
        <option value="asuransi">Asuransi (Insurance)</option>
        <option value="investasi">Investasi</option>
        <option value="cadangan">Dana Cadangan / Likuiditas Tambahan</option>
      </select>
    </div>
    <div>
      <label class="text-[12.5px] font-medium text-inksoft">Kategori</label>
      <input id="alc_sub" list="alc_sub_list" class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm" placeholder="Pilih / ketik" />
      <datalist id="alc_sub_list"></datalist>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-[12.5px] font-medium text-inksoft">Jumlah (Rp)</label>
        <input id="alc_amount" type="number" min="0" step="1" required class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm font-mono" placeholder="0" />
      </div>
      <div>
        <label class="text-[12.5px] font-medium text-inksoft">Tanggal</label>
        <input id="alc_date" type="date" required class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm" />
      </div>
    </div>
    <div>
      <label class="text-[12.5px] font-medium text-inksoft">Catatan (opsional)</label>
      <input id="alc_note" class="w-full mt-1 border border-line rounded-xl h-11 px-3 text-sm" />
    </div>
    <div class="flex gap-2 pt-1">
      <button type="button" id="alc_delete" class="hidden text-rust-600 text-sm font-semibold px-4 h-11 rounded-xl border border-rust-200">Hapus</button>
      <button type="submit" class="flex-1 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-xl h-11">Simpan</button>
    </div>
  </form>
</div>

<!-- ============ CONFIRM DELETE ============ -->
<div id="confirmModal" class="modal-backdrop fixed inset-0 bg-ink/40 z-50 items-center justify-center">
  <div class="bg-white rounded-2xl w-[300px] p-5 text-center space-y-3">
    <p class="text-sm text-ink">Hapus data ini? Tindakan tidak bisa dibatalkan.</p>
    <div class="flex gap-2">
      <button id="confirmCancel" class="flex-1 h-10 rounded-xl border border-line text-sm font-medium">Batal</button>
      <button id="confirmOk" class="flex-1 h-10 rounded-xl bg-rust-600 text-white text-sm font-semibold">Hapus</button>
    </div>
  </div>
</div>

<!-- toast -->
<div id="toastWrap" class="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 space-y-2"></div>
`;

export default function Home({ initialView = 'dashboard' }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.Chart = Chart;
    window.flatpickr = flatpickr;
    window.html2canvas = html2canvas;
    window.jspdf = { jsPDF };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service worker registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('Service worker registration failed:', error);
        });
    }

    const U = {
      uid: () => 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
      todayStr: () => U.iso(new Date()),
      iso: (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      },
      parseD: (s) => {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, m - 1, d);
      },
      addDays: (d, n) => {
        const r = new Date(d);
        r.setDate(r.getDate() + n);
        return r;
      },
      fmtIDR: (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID'),
      fmtDateID: (s) => U.parseD(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      fmtDateShort: (s) => U.parseD(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      getMonday: (d) => {
        const r = new Date(d);
        const day = (r.getDay() + 6) % 7;
        r.setDate(r.getDate() - day);
        r.setHours(0, 0, 0, 0);
        return r;
      },
      getSunday: (d) => U.addDays(U.getMonday(U.parseD(d)), 6),
      monthKey: (s) => s.slice(0, 7),
      monthLabel: (key) => {
        const [y, m] = key.split('-').map(Number);
        return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      },
      daysBetween: (a, b) => Math.round((U.parseD(b) - U.parseD(a)) / 86400000),
      clamp: (n, a, b) => Math.max(a, Math.min(b, n)),
    };

    const EXPENSE_CATS = {
      tetap: {
        label: 'Pengeluaran Tetap',
        color: '#1F6F5C',
        freq: [['harian', 'Harian'], ['mingguan', 'Mingguan'], ['bulanan', 'Bulanan']],
        subs: ['Sewa/Kontrakan Rumah', 'Tagihan Internet', 'Tagihan Listrik', 'Tagihan Air', 'Cicilan/KPR', 'Premi Asuransi', 'Langganan Digital', 'Lainnya'],
      },
      berkala: {
        label: 'Pengeluaran Berkala',
        color: '#DE9518',
        freq: [['3bulan', 'Tiap 3 Bulan'], ['6bulan', 'Tiap 6 Bulan'], ['tahunan', 'Tahunan']],
        subs: ['Pajak Kendaraan', 'Servis Besar Kendaraan', 'Perpanjangan STNK', 'Zakat / Sumbangan Tahunan', 'Lainnya'],
      },
      dinamis: {
        label: 'Pengeluaran Dinamis / Variabel',
        color: '#B8471F',
        freq: [['harian', 'Harian'], ['mingguan', 'Mingguan'], ['bulanan', 'Bulanan']],
        subs: ['Makan & Minum', 'Transportasi / BBM', 'Rekreasi / Hiburan', 'Belanja Kebutuhan', 'Kesehatan', 'Lainnya'],
      },
    };

    const INCOME_CATS = {
      earned: {
        label: 'Earned / Active Income',
        color: '#1F6F5C',
        subs: ['Gaji Bulanan', 'Upah Harian', 'Bonus', 'Komisi', 'Pekerjaan Lepas', 'Lainnya'],
      },
      passive: { label: 'Passive Income', color: '#4FA88E', subs: ['Sewa Properti', 'Royalti', 'Afiliasi', 'Lainnya'] },
      portfolio: {
        label: 'Portfolio / Investment Income',
        color: '#7EC2AC',
        subs: ['Dividen Saham', 'Bunga Deposito', 'Capital Gain', 'Reksadana', 'Lainnya'],
      },
    };

    const ALLOCATION_CATS = {
      darurat: { label: 'Dana Darurat', color: '#1F6F5C', subs: ['Dana Darurat'] },
      asuransi: { label: 'Asuransi', color: '#4FA88E', subs: ['Asuransi Jiwa', 'Asuransi Kesehatan', 'Asuransi Kendaraan', 'Lainnya'] },
      investasi: { label: 'Investasi', color: '#DE9518', subs: ['Saham', 'Reksadana', 'Obligasi', 'Emas', 'Kripto', 'Lainnya'] },
      cadangan: { label: 'Dana Cadangan / Likuiditas', color: '#B8471F', subs: ['Dana Liburan', 'Dana Perayaan', 'Cadangan Lainnya'] },
    };

    class Store {
      constructor() {
        this.hasWidgetStorage = typeof window !== 'undefined' && !!window.storage;
        this.hasLocalStorage = (() => {
          try {
            localStorage.setItem('__t', '1');
            localStorage.removeItem('__t');
            return true;
          } catch (e) {
            return false;
          }
        })();
        this.mem = {};
      }
      async get(key) {
        if (this.hasWidgetStorage) {
          try {
            const r = await window.storage.get(key, false);
            return r ? r.value : null;
          } catch (e) {
            return null;
          }
        }
        if (this.hasLocalStorage) {
          return localStorage.getItem(key);
        }
        return key in this.mem ? this.mem[key] : null;
      }
      async set(key, value) {
        if (this.hasWidgetStorage) {
          try {
            await window.storage.set(key, value, false);
            return true;
          } catch (e) {
            return false;
          }
        }
        if (this.hasLocalStorage) {
          try {
            localStorage.setItem(key, value);
            return true;
          } catch (e) {
            return false;
          }
        }
        this.mem[key] = value;
        return true;
      }
    }

    class Repo {
      constructor(store, key) {
        this.store = store;
        this.key = key;
        this.items = [];
      }
      async load() {
        const raw = await this.store.get(this.key);
        this.items = raw ? JSON.parse(raw) : [];
        return this.items;
      }
      async persist() {
        await this.store.set(this.key, JSON.stringify(this.items));
      }
      async add(item) {
        this.items.push(item);
        await this.persist();
      }
      async update(id, patch) {
        const i = this.items.findIndex((x) => x.id === id);
        if (i > -1) {
          this.items[i] = { ...this.items[i], ...patch };
          await this.persist();
        }
      }
      async remove(id) {
        this.items = this.items.filter((x) => x.id !== id);
        await this.persist();
      }
      find(id) {
        return this.items.find((x) => x.id === id);
      }
      inRange(start, end) {
        return this.items.filter((x) => x.date >= start && x.date <= end);
      }
    }

    class Aggregator {
      static byCategory(items) {
        const m = {};
        items.forEach((x) => {
          m[x.category] = (m[x.category] || 0) + Number(x.amount);
        });
        return m;
      }
      static total(items) {
        return items.reduce((s, x) => s + Number(x.amount), 0);
      }
      static byWeek(items) {
        const m = {};
        items.forEach((x) => {
          const wkKey = U.iso(U.getMonday(U.parseD(x.date)));
          m[wkKey] = (m[wkKey] || 0) + Number(x.amount);
        });
        return m;
      }
      static byMonth(items) {
        const m = {};
        items.forEach((x) => {
          const k = U.monthKey(x.date);
          m[k] = (m[k] || 0) + Number(x.amount);
        });
        return m;
      }
    }

    function toast(msg, kind = 'ok') {
      const wrap = document.getElementById('toastWrap');
      if (!wrap) return;
      const el = document.createElement('div');
      const bg = kind === 'ok' ? 'bg-teal-700' : kind === 'err' ? 'bg-rust-600' : 'bg-ink';
      el.className = `toast ${bg} text-white text-[13px] font-medium px-4 py-2.5 rounded-xl shadow-lg`;
      el.textContent = msg;
      wrap.appendChild(el);
      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transition = 'opacity .3s';
        setTimeout(() => el.remove(), 300);
      }, 2200);
    }

    class App {
      constructor(initialView = 'dashboard') {
        this.store = new Store();
        this.expenses = new Repo(this.store, 'cashmoney:expenses');
        this.incomes = new Repo(this.store, 'cashmoney:incomes');
        this.allocations = new Repo(this.store, 'cashmoney:allocations');
        this.expenseFilter = 'all';
        this.incomeFilter = 'all';
        this.charts = {};
        this.confirmCb = null;
        this.initialView = initialView;
        const today = new Date();
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        this.range = { start: U.iso(first), end: U.iso(today) };
      }
      async init() {
        this.bindNav();
        this.bindModals();
        this.bindRangePicker();
        this.switchView(this.initialView);
        this.renderAll();

        const fallbackCleanup = setTimeout(() => {
          this.hideLoading();
        }, 400);

        try {
          await Promise.all([this.expenses.load(), this.incomes.load(), this.allocations.load()]);
        } catch (e) {
          console.error('Gagal memuat data tersimpan:', e);
          toast('Gagal memuat data tersimpan, memulai dengan data kosong', 'err');
        } finally {
          clearTimeout(fallbackCleanup);
          this.renderAll();
          this.hideLoading();
        }
      }
      hideLoading() {
        // fade out built-in loading overlay (if present)
        const el = document.getElementById('loadingOverlay');
        if (el) {
          el.style.opacity = '0';
          el.style.transition = 'opacity .25s ease';
          setTimeout(() => el.remove(), 260);
        }
        // also remove splash overlay if present
        const splash = document.getElementById('splashOverlay');
        if (splash) {
          splash.classList.add('splash-hidden');
          setTimeout(() => splash.remove(), 380);
        }
      }
      switchView(view) {
        document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
        const target = document.getElementById('view-' + view);
        if (target) target.classList.add('active');
        document.querySelectorAll('.nav-link').forEach((n) => n.classList.toggle('active', n.dataset.view === view));
        document.querySelectorAll('.nav-link-mobile').forEach((n) => {
          const on = n.dataset.view === view;
          n.classList.toggle('active', on);
          n.classList.toggle('text-teal-700', on);
          n.classList.toggle('text-inksoft', !on);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (view === 'reports') this.renderReports();
      }
      bindNav() {
        const go = (view) => {
          this.switchView(view);
        };
        document.querySelectorAll('[data-view]').forEach((btn) => btn.addEventListener('click', () => go(btn.dataset.view)));
        document.getElementById('alertBell')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleAlertDropdown();
        });
        document.getElementById('alertBanner')?.addEventListener('click', () => this.openAlertDropdown());
        document.addEventListener('click', (e) => {
          const dd = document.getElementById('alertDropdown');
          const bell = document.getElementById('alertBell');
          if (dd && !dd.classList.contains('hidden') && !dd.contains(e.target) && bell && !bell.contains(e.target)) {
            dd.classList.add('hidden');
          }
        });
        document.querySelectorAll('#expenseCatTabs [data-cat]').forEach((btn) => btn.addEventListener('click', () => {
          this.expenseFilter = btn.dataset.cat;
          document.querySelectorAll('#expenseCatTabs [data-cat]').forEach((b) => b.classList.toggle('active', b === btn));
          this.renderExpenseList();
        }));
        document.querySelectorAll('#incomeCatTabs [data-cat]').forEach((btn) => btn.addEventListener('click', () => {
          this.incomeFilter = btn.dataset.cat;
          document.querySelectorAll('#incomeCatTabs [data-cat]').forEach((b) => b.classList.toggle('active', b === btn));
          this.renderIncomeList();
        }));
      }
      bindRangePicker() {
        const updateLabel = () => {
          const labelEl = document.getElementById('rangeLabel');
          if (labelEl) labelEl.textContent = `${U.fmtDateShort(this.range.start)} – ${U.fmtDateShort(this.range.end)}`;
        };
        updateLabel();
        const input = document.getElementById('rangeInput');
        if (!input) return;
        this.fp = flatpickr(input, {
          mode: 'range',
          dateFormat: 'Y-m-d',
          defaultDate: [this.range.start, this.range.end],
          locale: { rangeSeparator: ' s/d ' },
          onClose: (selectedDates) => {
            if (selectedDates.length === 2) {
              this.range.start = U.iso(selectedDates[0]);
              this.range.end = U.iso(selectedDates[1]);
              updateLabel();
              this.renderAll();
            }
          },
        });
        document.getElementById('rangeBtn')?.addEventListener('click', () => this.fp.open());
      }
      bindModals() {
        document.getElementById('quickAddBtn')?.addEventListener('click', () => this.openModal('quickAddModal'));
        document.getElementById('quickAddCancel')?.addEventListener('click', () => this.closeModal('quickAddModal'));
        document.querySelectorAll('[data-add]').forEach((btn) => btn.addEventListener('click', () => {
          this.closeModal('quickAddModal');
          this.openEntryForm(btn.dataset.add);
        }));
        document.querySelectorAll('.modal-close').forEach((btn) => btn.addEventListener('click', (e) => {
          const parent = e.target.closest('.modal-backdrop');
          if (parent) this.closeModal(parent.id);
        }));
        document.querySelectorAll('.modal-backdrop').forEach((m) => m.addEventListener('click', (e) => {
          if (e.target === m) this.closeModal(m.id);
        }));
        const expCat = document.getElementById('exp_category');
        expCat?.addEventListener('change', () => this.refreshExpenseFormFields());
        document.getElementById('expenseForm')?.addEventListener('submit', (e) => this.submitExpense(e));
        document.getElementById('incomeForm')?.addEventListener('submit', (e) => this.submitIncome(e));
        document.getElementById('allocationForm')?.addEventListener('submit', (e) => this.submitAllocation(e));
        document.getElementById('exp_delete')?.addEventListener('click', () => this.confirm(async () => {
          await this.expenses.remove(document.getElementById('exp_id').value);
          this.closeModal('expenseModal');
          this.renderAll();
          toast('Pengeluaran dihapus');
        }));
        document.getElementById('inc_delete')?.addEventListener('click', () => this.confirm(async () => {
          await this.incomes.remove(document.getElementById('inc_id').value);
          this.closeModal('incomeModal');
          this.renderAll();
          toast('Pemasukan dihapus');
        }));
        document.getElementById('alc_delete')?.addEventListener('click', () => this.confirm(async () => {
          await this.allocations.remove(document.getElementById('alc_id').value);
          this.closeModal('allocationModal');
          this.renderAll();
          toast('Alokasi dihapus');
        }));
        document.getElementById('confirmCancel')?.addEventListener('click', () => this.closeModal('confirmModal'));
        document.getElementById('confirmOk')?.addEventListener('click', async () => {
          if (this.confirmCb) await this.confirmCb();
          this.closeModal('confirmModal');
        });
        document.getElementById('exportPdfBtn')?.addEventListener('click', () => this.exportPdf());
      }
      openModal(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
      }
      closeModal(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
      }
      confirm(cb) {
        this.confirmCb = cb;
        this.openModal('confirmModal');
      }
      refreshExpenseFormFields() {
        const cat = document.getElementById('exp_category').value;
        const def = EXPENSE_CATS[cat];
        const freqSel = document.getElementById('exp_freq');
        if (freqSel) {
          freqSel.innerHTML = def.freq.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
        }
        const subList = document.getElementById('exp_sub_list');
        if (subList) {
          subList.innerHTML = def.subs.map((s) => `<option value="${s}">`).join('');
        }
        const statusWrap = document.getElementById('exp_status_wrap');
        if (statusWrap) statusWrap.classList.toggle('hidden', cat === 'dinamis');
      }
      openEntryForm(type, existingId) {
        if (type === 'expense') {
          const form = document.getElementById('expenseForm');
          form?.reset();
          document.getElementById('exp_id').value = '';
          document.getElementById('exp_delete')?.classList.add('hidden');
          document.getElementById('exp_date').value = U.todayStr();
          this.refreshExpenseFormFields();
          if (existingId) {
            const it = this.expenses.find(existingId);
            if (it) {
              document.getElementById('exp_id').value = it.id;
              document.getElementById('exp_category').value = it.category;
              this.refreshExpenseFormFields();
              document.getElementById('exp_sub').value = it.subcategory;
              document.getElementById('exp_freq').value = it.freq;
              document.getElementById('exp_amount').value = it.amount;
              document.getElementById('exp_date').value = it.date;
              document.getElementById('exp_status').value = it.status;
              document.getElementById('exp_estimate').checked = !!it.isEstimate;
              document.getElementById('exp_note').value = it.note || '';
              document.getElementById('exp_delete')?.classList.remove('hidden');
            }
          }
          this.openModal('expenseModal');
        } else if (type === 'income') {
          const form = document.getElementById('incomeForm');
          form?.reset();
          document.getElementById('inc_id').value = '';
          document.getElementById('inc_delete')?.classList.add('hidden');
          document.getElementById('inc_date').value = U.todayStr();
          document.getElementById('inc_sub_list').innerHTML = INCOME_CATS.earned.subs.map((s) => `<option value="${s}">`).join('');
          document.getElementById('inc_category').onchange = () => {
            document.getElementById('inc_sub_list').innerHTML = INCOME_CATS[document.getElementById('inc_category').value].subs.map((s) => `<option value="${s}">`).join('');
          };
          if (existingId) {
            const it = this.incomes.find(existingId);
            if (it) {
              document.getElementById('inc_id').value = it.id;
              document.getElementById('inc_category').value = it.category;
              document.getElementById('inc_category').onchange();
              document.getElementById('inc_sub').value = it.subcategory;
              document.getElementById('inc_amount').value = it.amount;
              document.getElementById('inc_date').value = it.date;
              document.getElementById('inc_note').value = it.note || '';
              document.getElementById('inc_delete')?.classList.remove('hidden');
            }
          }
          this.openModal('incomeModal');
        } else if (type === 'allocation') {
          const form = document.getElementById('allocationForm');
          form?.reset();
          document.getElementById('alc_id').value = '';
          document.getElementById('alc_delete')?.classList.add('hidden');
          document.getElementById('alc_date').value = U.todayStr();
          document.getElementById('alc_sub_list').innerHTML = ALLOCATION_CATS.darurat.subs.map((s) => `<option value="${s}">`).join('');
          document.getElementById('alc_category').onchange = () => {
            document.getElementById('alc_sub_list').innerHTML = ALLOCATION_CATS[document.getElementById('alc_category').value].subs.map((s) => `<option value="${s}">`).join('');
          };
          if (existingId) {
            const it = this.allocations.find(existingId);
            if (it) {
              document.getElementById('alc_id').value = it.id;
              document.getElementById('alc_category').value = it.category;
              document.getElementById('alc_category').onchange();
              document.getElementById('alc_sub').value = it.subcategory;
              document.getElementById('alc_amount').value = it.amount;
              document.getElementById('alc_date').value = it.date;
              document.getElementById('alc_note').value = it.note || '';
              document.getElementById('alc_delete')?.classList.remove('hidden');
            }
          }
          this.openModal('allocationModal');
        }
      }
      async submitExpense(e) {
        e.preventDefault();
        const cat = document.getElementById('exp_category').value;
        const id = document.getElementById('exp_id').value || U.uid();
        const data = {
          id,
          category: cat,
          subcategory: document.getElementById('exp_sub').value || EXPENSE_CATS[cat].subs[EXPENSE_CATS[cat].subs.length - 1],
          freq: document.getElementById('exp_freq').value,
          amount: Number(document.getElementById('exp_amount').value || 0),
          date: document.getElementById('exp_date').value,
          status: cat === 'dinamis' ? 'paid' : document.getElementById('exp_status').value,
          isEstimate: document.getElementById('exp_estimate').checked,
          note: document.getElementById('exp_note').value,
          createdAt: Date.now(),
        };
        if (this.expenses.find(id)) await this.expenses.update(id, data); else await this.expenses.add(data);
        this.closeModal('expenseModal');
        this.renderAll();
        toast('Pengeluaran tersimpan');
      }
      async submitIncome(e) {
        e.preventDefault();
        const cat = document.getElementById('inc_category').value;
        const id = document.getElementById('inc_id').value || U.uid();
        const data = {
          id,
          category: cat,
          subcategory: document.getElementById('inc_sub').value || INCOME_CATS[cat].subs[INCOME_CATS[cat].subs.length - 1],
          amount: Number(document.getElementById('inc_amount').value || 0),
          date: document.getElementById('inc_date').value,
          note: document.getElementById('inc_note').value,
          createdAt: Date.now(),
        };
        if (this.incomes.find(id)) await this.incomes.update(id, data); else await this.incomes.add(data);
        this.closeModal('incomeModal');
        this.renderAll();
        toast('Pemasukan tersimpan');
      }
      async submitAllocation(e) {
        e.preventDefault();
        const cat = document.getElementById('alc_category').value;
        const id = document.getElementById('alc_id').value || U.uid();
        const data = {
          id,
          category: cat,
          subcategory: document.getElementById('alc_sub').value || ALLOCATION_CATS[cat].subs[ALLOCATION_CATS[cat].subs.length - 1],
          amount: Number(document.getElementById('alc_amount').value || 0),
          date: document.getElementById('alc_date').value,
          note: document.getElementById('alc_note').value,
          createdAt: Date.now(),
        };
        if (this.allocations.find(id)) await this.allocations.update(id, data); else await this.allocations.add(data);
        this.closeModal('allocationModal');
        this.renderAll();
        toast('Alokasi tersimpan');
      }
      async markPaid(id) {
        await this.expenses.update(id, { status: 'paid' });
        this.renderAll();
        toast('Ditandai lunas');
      }
      toggleAlertDropdown() {
        const dd = document.getElementById('alertDropdown');
        if (dd) dd.classList.toggle('hidden');
      }
      openAlertDropdown() {
        document.getElementById('alertDropdown')?.classList.remove('hidden');
      }
      ensureRangeIncludes(dateStr) {
        let changed = false;
        if (dateStr < this.range.start) {
          this.range.start = dateStr;
          changed = true;
        }
        if (dateStr > this.range.end) {
          this.range.end = dateStr;
          changed = true;
        }
        if (changed) {
          this.fp.setDate([this.range.start, this.range.end], false);
          const labelEl = document.getElementById('rangeLabel');
          if (labelEl) labelEl.textContent = `${U.fmtDateShort(this.range.start)} – ${U.fmtDateShort(this.range.end)}`;
        }
        return changed;
      }
      renderAll() {
        this.renderDashboard();
        this.renderExpenseList();
        this.renderIncomeList();
        this.renderAllocations();
        if (document.getElementById('view-reports')?.classList.contains('active')) this.renderReports();
      }
      currentExpenses() {
        return this.expenses.inRange(this.range.start, this.range.end).filter((x) => !x.isEstimate);
      }
      currentIncomes() {
        return this.incomes.inRange(this.range.start, this.range.end);
      }
      currentAllocations() {
        return this.allocations.inRange(this.range.start, this.range.end);
      }
      renderDashboard() {
        const exp = this.currentExpenses();
        const inc = this.currentIncomes();
        const alc = this.currentAllocations();
        const totalInc = Aggregator.total(inc);
        const totalExp = Aggregator.total(exp);
        const totalAlc = Aggregator.total(alc);
        const balance = totalInc - totalExp - totalAlc;
        document.getElementById('dashPeriodLabel').textContent = `Periode: ${U.fmtDateID(this.range.start)} – ${U.fmtDateID(this.range.end)}`;
        document.getElementById('sumIncome').textContent = U.fmtIDR(totalInc);
        document.getElementById('sumExpense').textContent = U.fmtIDR(totalExp);
        document.getElementById('sumAllocation').textContent = U.fmtIDR(totalAlc);
        document.getElementById('sumBalance').textContent = U.fmtIDR(balance);
        const card = document.getElementById('sumBalanceCard');
        const badge = document.getElementById('balanceBadge');
        if (card && badge) {
          if (balance < 0) {
            card.classList.remove('bg-teal-700', 'border-teal-700');
            card.classList.add('bg-rust-600', 'border-rust-600');
            badge.textContent = 'MINUS';
            badge.classList.remove('bg-white/20');
          } else {
            card.classList.add('bg-teal-700', 'border-teal-700');
            card.classList.remove('bg-rust-600', 'border-rust-600');
            badge.textContent = 'SURPLUS';
          }
        }
        const unpaid = this.expenses.items.filter((x) => (x.category === 'tetap' || x.category === 'berkala') && x.status === 'unpaid' && !x.isEstimate).sort((a, b) => a.date.localeCompare(b.date));
        const bell = document.getElementById('alertDot');
        const banner = document.getElementById('alertBanner');
        if (unpaid.length) {
          if (bell) {
            bell.textContent = String(unpaid.length);
            bell.classList.remove('hidden');
            bell.classList.add('flex');
          }
          banner?.classList.remove('hidden');
          document.getElementById('alertBannerText').textContent = `${unpaid.length} tagihan belum dibayar — total ${U.fmtIDR(Aggregator.total(unpaid))}`;
        } else {
          bell?.classList.add('hidden');
          banner?.classList.add('hidden');
        }
        const listEl = document.getElementById('unpaidList');
        if (listEl) {
          listEl.innerHTML = unpaid.length
            ? unpaid.map((x) => {
                const days = U.daysBetween(x.date, U.todayStr());
                const overdue = days > 0;
                return `<div class="flex items-center justify-between gap-3 p-3 rounded-xl border border-line">
        <div class="min-w-0">
          <p class="text-sm font-medium truncate">${x.subcategory}</p>
          <p class="text-[12px] ${overdue ? 'text-rust-600' : 'text-inksoft'}">${overdue ? `Terlambat ${days} hari` : `Jatuh tempo ${U.fmtDateID(x.date)}`} · ${EXPENSE_CATS[x.category].label}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="font-mono text-sm font-semibold">${U.fmtIDR(x.amount)}</span>
          <button data-mark-paid="${x.id}" class="text-[12px] font-semibold text-teal-700 border border-teal-200 rounded-lg px-2.5 py-1.5 hover:bg-teal-50">Tandai Lunas</button>
        </div>
      </div>`;
              })
                .join('')
            : `<p class="text-sm text-inksoft py-4 text-center">Tidak ada tagihan tertunda. Mantap! 🎉</p>`;
          listEl.querySelectorAll('[data-mark-paid]').forEach((b) => b.addEventListener('click', () => this.markPaid(b.dataset.markPaid)));
        }
        this.renderCascade(exp);
        this.renderTrendChart(exp, inc);
        this.renderDonut('chartExpenseDonut', Aggregator.byCategory(exp), EXPENSE_CATS);
      }
      renderCascade(exp) {
        const wrap = document.getElementById('cascadeWrap');
        if (!wrap) return;
        const end = U.parseD(this.range.end);
        const days = [];
        for (let i = 6; i >= 0; i -= 1) {
          const d = U.addDays(end, -i);
          const key = U.iso(d);
          const total = this.expenses.items.filter((x) => x.date === key && !x.isEstimate).reduce((s, x) => s + Number(x.amount), 0);
          days.push({ key, total, label: d.toLocaleDateString('id-ID', { weekday: 'short' }) });
        }
        const weekTotal = days.reduce((s, d) => s + d.total, 0);
        const monthKey = U.monthKey(this.range.end);
        const monthTotal = this.expenses.items.filter((x) => U.monthKey(x.date) === monthKey && !x.isEstimate).reduce((s, x) => s + Number(x.amount), 0);
        const maxDay = Math.max(...days.map((d) => d.total), 1);
        wrap.innerHTML = `
      <div class="flex items-end gap-4 min-w-max px-1">
        <div class="flex items-end gap-1.5">
          ${days
            .map(
              (d) => `
            <div class="flex flex-col items-center gap-1 w-11">
              <div class="w-full h-24 bg-teal-50 rounded-lg flex items-end overflow-hidden">
                <div class="cascade-bar w-full bg-teal-500 rounded-t" style="height:${U.clamp((d.total / maxDay) * 100, 3, 100)}%"></div>
              </div>
              <span class="text-[10px] text-inksoft">${d.label}</span>
            </div>`
            )
            .join('')}
        </div>
        <svg width="22" height="16" viewBox="0 0 24 24" fill="none" stroke="#7EC2AC" stroke-width="2.4" class="shrink-0 mb-6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        <div class="flex flex-col items-center gap-1 shrink-0">
          <div class="w-24 h-24 rounded-xl bg-teal-700 flex flex-col items-center justify-center text-white">
            <span class="text-[10px] opacity-80">Minggu ini</span>
            <span class="font-mono text-[13px] font-bold">${U.fmtIDR(weekTotal)}</span>
          </div>
        </div>
        <svg width="22" height="16" viewBox="0 0 24 24" fill="none" stroke="#7EC2AC" stroke-width="2.4" class="shrink-0 mb-6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        <div class="flex flex-col items-center gap-1 shrink-0">
          <div class="w-28 h-24 rounded-xl bg-ink flex flex-col items-center justify-center text-white">
            <span class="text-[10px] opacity-70">${U.monthLabel(monthKey)}</span>
            <span class="font-mono text-[13px] font-bold">${U.fmtIDR(monthTotal)}</span>
          </div>
        </div>
      </div>`;
      }
      renderTrendChart(exp, inc) {
        const ctx = document.getElementById('chartTrend');
        if (!ctx) return;
        const weeksExp = Aggregator.byWeek(exp);
        const weeksInc = Aggregator.byWeek(inc);
        const keys = Array.from(new Set([...Object.keys(weeksExp), ...Object.keys(weeksInc)])).sort();
        const labels = keys.map((k) => 'Mgg ' + U.fmtDateShort(k));
        const dataExp = keys.map((k) => weeksExp[k] || 0);
        const dataInc = keys.map((k) => weeksInc[k] || 0);
        if (this.charts.trend) this.charts.trend.destroy();
        this.charts.trend = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              { label: 'Pemasukan', data: dataInc, backgroundColor: '#4FA88E', borderRadius: 6, maxBarThickness: 28 },
              { label: 'Pengeluaran', data: dataExp, backgroundColor: '#CE5A32', borderRadius: 6, maxBarThickness: 28 },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
            scales: {
              y: { ticks: { callback: (v) => v / 1000 + 'k', font: { size: 10 } }, grid: { color: '#EEF2EF' } },
              x: { ticks: { font: { size: 10 } }, grid: { display: false } },
            },
          },
        });
      }
      renderDonut(canvasId, byCat, defs) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        const keys = Object.keys(defs).filter((k) => byCat[k]);
        const labels = keys.map((k) => defs[k].label);
        const data = keys.map((k) => byCat[k] || 0);
        const colors = keys.map((k) => defs[k].color);
        if (this.charts[canvasId]) this.charts[canvasId].destroy();
        this.charts[canvasId] = new Chart(ctx, {
          type: 'doughnut',
          data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }] },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10.5 }, padding: 10 } } },
          },
        });
      }
      renderExpenseList() {
        let items = this.expenses.inRange(this.range.start, this.range.end);
        if (this.expenseFilter !== 'all') items = items.filter((x) => x.category === this.expenseFilter);
        items = items.slice().sort((a, b) => b.date.localeCompare(a.date));
        const actual = this.expenses.inRange(this.range.start, this.range.end).filter((x) => !x.isEstimate);
        document.getElementById('totTetap').textContent = U.fmtIDR(actual.filter((x) => x.category === 'tetap').reduce((s, x) => s + Number(x.amount), 0));
        document.getElementById('totBerkala').textContent = U.fmtIDR(actual.filter((x) => x.category === 'berkala').reduce((s, x) => s + Number(x.amount), 0));
        document.getElementById('totDinamis').textContent = U.fmtIDR(actual.filter((x) => x.category === 'dinamis').reduce((s, x) => s + Number(x.amount), 0));
        const list = document.getElementById('expenseList');
        if (!list) return;
        list.innerHTML = items.length
          ? items
              .map(
                (x) => `
      <div data-edit="${x.id}" class="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-line bg-white hover:border-teal-300 cursor-pointer transition">
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${EXPENSE_CATS[x.category].color}"></span>
          <div class="min-w-0">
            <p class="text-sm font-medium truncate">${x.subcategory}${x.isEstimate ? '<span class="text-[10px] font-semibold text-amber-600 bg-amber-50 rounded-full px-1.5 py-0.5 ml-1">Estimasi</span>' : ''}</p>
            <p class="text-[12px] text-inksoft">${U.fmtDateID(x.date)} · ${EXPENSE_CATS[x.category].label}${x.category !== 'dinamis' ? ' · ' + (x.status === 'paid' ? '<span class="text-teal-600">Lunas</span>' : '<span class="text-rust-600">Belum bayar</span>') : ''}</p>
          </div>
        </div>
        <span class="font-mono text-sm font-semibold text-rust-600 shrink-0">- ${U.fmtIDR(x.amount)}</span>
      </div>`
              )
              .join('')
          : `<p class="text-sm text-inksoft py-8 text-center">Belum ada data pada periode ini.</p>`;
        list.querySelectorAll('[data-edit]').forEach((el) => el.addEventListener('click', () => this.openEntryForm('expense', el.dataset.edit)));
      }
      renderIncomeList() {
        let items = this.incomes.inRange(this.range.start, this.range.end);
        if (this.incomeFilter !== 'all') items = items.filter((x) => x.category === this.incomeFilter);
        items = items.slice().sort((a, b) => b.date.localeCompare(a.date));
        const list = document.getElementById('incomeList');
        if (!list) return;
        list.innerHTML = items.length
          ? items
              .map(
                (x) => `
      <div data-edit="${x.id}" class="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-line bg-white hover:border-teal-300 cursor-pointer transition">
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${INCOME_CATS[x.category].color}"></span>
          <div class="min-w-0">
            <p class="text-sm font-medium truncate">${x.subcategory}</p>
            <p class="text-[12px] text-inksoft">${U.fmtDateID(x.date)} · ${INCOME_CATS[x.category].label}</p>
          </div>
        </div>
        <span class="font-mono text-sm font-semibold text-teal-700 shrink-0">+ ${U.fmtIDR(x.amount)}</span>
      </div>`
              )
              .join('')
          : `<p class="text-sm text-inksoft py-8 text-center">Belum ada data pada periode ini.</p>`;
        list.querySelectorAll('[data-edit]').forEach((el) => el.addEventListener('click', () => this.openEntryForm('income', el.dataset.edit)));
      }
      renderAllocations() {
        const items = this.allocations.inRange(this.range.start, this.range.end);
        const byCat = Aggregator.byCategory(items);
        const cardsEl = document.getElementById('allocationCards');
        if (cardsEl) {
          cardsEl.innerHTML = Object.keys(ALLOCATION_CATS)
            .map(
              (k) => `
      <div class="bg-surface rounded-2xl shadow-card border border-line p-4">
        <p class="text-[12px] text-inksoft font-medium">${ALLOCATION_CATS[k].label}</p>
        <p class="font-mono font-bold text-lg mt-1" style="color:${ALLOCATION_CATS[k].color}">${U.fmtIDR(byCat[k] || 0)}</p>
      </div>`
            )
            .join('');
        }
        const list = document.getElementById('allocationList');
        if (!list) return;
        const sorted = items.slice().sort((a, b) => b.date.localeCompare(a.date));
        list.innerHTML = sorted.length
          ? sorted
              .map(
                (x) => `
      <div data-edit="${x.id}" class="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-line bg-white hover:border-teal-300 cursor-pointer transition">
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${ALLOCATION_CATS[x.category].color}"></span>
          <div class="min-w-0">
            <p class="text-sm font-medium truncate">${x.subcategory}</p>
            <p class="text-[12px] text-inksoft">${U.fmtDateID(x.date)} · ${ALLOCATION_CATS[x.category].label}</p>
          </div>
        </div>
        <span class="font-mono text-sm font-semibold text-amber-600 shrink-0">${U.fmtIDR(x.amount)}</span>
      </div>`
              )
              .join('')
          : `<p class="text-sm text-inksoft py-8 text-center">Belum ada data pada periode ini.</p>`;
        list.querySelectorAll('[data-edit]').forEach((el) => el.addEventListener('click', () => this.openEntryForm('allocation', el.dataset.edit)));
      }
      renderReports() {
        const exp = this.currentExpenses();
        const inc = this.currentIncomes();
        const alc = this.currentAllocations();
        const totalInc = Aggregator.total(inc);
        const totalExp = Aggregator.total(exp);
        const totalAlc = Aggregator.total(alc);
        const balance = totalInc - totalExp - totalAlc;
        document.getElementById('reportPeriod').innerHTML = `Periode Laporan<br>${U.fmtDateID(this.range.start)} – ${U.fmtDateID(this.range.end)}`;
        document.getElementById('repIncome').textContent = U.fmtIDR(totalInc);
        document.getElementById('repExpense').textContent = U.fmtIDR(totalExp);
        document.getElementById('repAllocation').textContent = U.fmtIDR(totalAlc);
        document.getElementById('repBalance').textContent = U.fmtIDR(balance);
        this.renderDonut('chartRepExpense', Aggregator.byCategory(exp), EXPENSE_CATS);
        this.renderDonut('chartRepIncome', Aggregator.byCategory(inc), INCOME_CATS);
        const endD = U.parseD(this.range.end);
        const monthKeys = [];
        for (let i = 5; i >= 0; i -= 1) {
          const d = new Date(endD.getFullYear(), endD.getMonth() - i, 1);
          monthKeys.push(U.iso(d).slice(0, 7));
        }
        const expByMonth = Aggregator.byMonth(this.expenses.items.filter((x) => !x.isEstimate));
        const incByMonth = Aggregator.byMonth(this.incomes.items);
        const ctx = document.getElementById('chartRepTrend');
        if (ctx) {
          if (this.charts.repTrend) this.charts.repTrend.destroy();
          this.charts.repTrend = new Chart(ctx, {
            type: 'line',
            data: {
              labels: monthKeys.map((k) => U.monthLabel(k)),
              datasets: [
                { label: 'Pemasukan', data: monthKeys.map((k) => incByMonth[k] || 0), borderColor: '#1F6F5C', backgroundColor: '#1F6F5C22', tension: 0.35, fill: true },
                { label: 'Pengeluaran', data: monthKeys.map((k) => expByMonth[k] || 0), borderColor: '#CE5A32', backgroundColor: '#CE5A3222', tension: 0.35, fill: true },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
              scales: { y: { ticks: { callback: (v) => (v / 1000) + 'k', font: { size: 10 } }, grid: { color: '#EEF2EF' } }, x: { ticks: { font: { size: 10 } }, grid: { display: false } } },
            },
          });
        }
        const rowsHtml = (defs, items) =>
          Object.keys(defs)
            .map((k) => {
              const sub = items.filter((x) => x.category === k);
              const tot = sub.reduce((s, x) => s + Number(x.amount), 0);
              if (!tot) return '';
              return `<tr class="border-b border-line"><td class="py-1.5 pr-2" style="color:${defs[k].color}">● ${defs[k].label}</td><td class="py-1.5 text-right font-mono font-semibold">${U.fmtIDR(tot)}</td></tr>`;
            })
            .join('') || `<tr><td class="py-3 text-inksoft text-center" colspan="2">Tidak ada data</td></tr>`;
        document.getElementById('repExpenseTable').innerHTML = rowsHtml(EXPENSE_CATS, exp);
        document.getElementById('repIncomeTable').innerHTML = rowsHtml(INCOME_CATS, inc);
        document.getElementById('repAllocationTable').innerHTML = rowsHtml(ALLOCATION_CATS, alc);
        document.getElementById('repSuggestions').innerHTML = this.generateSuggestions({ exp, inc, alc, totalInc, totalExp, totalAlc, balance })
          .map((s) => `<li>${s}</li>`)
          .join('');
      }
      generateSuggestions({ exp, inc, alc, totalInc, totalExp, totalAlc, balance }) {
        const s = [];
        if (totalInc === 0) {
          s.push('Belum ada pemasukan tercatat pada periode ini — tambahkan data pemasukan agar laporan lebih akurat.');
        }
        if (balance < 0) {
          s.push(`Pengeluaran melebihi pemasukan sebesar ${U.fmtIDR(Math.abs(balance))} pada periode ini. Prioritaskan pengeluaran tetap dan tinjau ulang pengeluaran dinamis/variabel.`);
        } else if (totalInc > 0) {
          s.push(`Saldo bersih periode ini positif sebesar ${U.fmtIDR(balance)}. Pertimbangkan mengalokasikan sebagian surplus ke dana darurat atau investasi.`);
        }
        const dinamisTotal = exp.filter((x) => x.category === 'dinamis').reduce((s2, x) => s2 + Number(x.amount), 0);
        if (totalInc > 0 && dinamisTotal / totalInc > 0.3) {
          s.push(`Pengeluaran dinamis/variabel mencapai ${Math.round((dinamisTotal / totalInc) * 100)}% dari pemasukan. Idealnya di bawah 30% agar ruang tabungan tetap sehat.`);
        }
        const unpaidCount = this.expenses.items.filter((x) => (x.category === 'tetap' || x.category === 'berkala') && x.status === 'unpaid').length;
        if (unpaidCount > 0) {
          s.push(`Ada ${unpaidCount} tagihan tetap/berkala yang belum dibayar. Segera lunasi untuk menghindari denda atau bunga keterlambatan.`);
        }
        const daruratTotal = this.allocations.items.filter((x) => x.category === 'darurat').reduce((s2, x) => s2 + Number(x.amount), 0);
        const avgMonthlyExp = (Aggregator.total(this.expenses.items.filter((x) => !x.isEstimate)) / Math.max(1, new Set(this.expenses.items.map((x) => U.monthKey(x.date))).size)) || 0;
        if (avgMonthlyExp > 0 && daruratTotal < avgMonthlyExp * 3) {
          s.push(`Total dana darurat (${U.fmtIDR(daruratTotal)}) masih di bawah 3x rata-rata pengeluaran bulanan (${U.fmtIDR(avgMonthlyExp)}). Pertimbangkan menambah alokasi dana darurat secara bertahap.`);
        }
        const investasiTotal = this.allocations.items.filter((x) => x.category === 'investasi').reduce((s2, x) => s2 + Number(x.amount), 0);
        if (investasiTotal === 0) {
          s.push('Belum ada alokasi ke investasi. Mulai dari nominal kecil secara rutin bisa membantu nilai dana tidak tergerus inflasi.');
        }
        const passivePortfolio = this.incomes.items.filter((x) => x.category === 'passive' || x.category === 'portfolio').reduce((s2, x) => s2 + Number(x.amount), 0);
        if (passivePortfolio === 0) {
          s.push('Sumber pemasukan masih sepenuhnya dari earned/active income. Diversifikasi ke passive atau portfolio income dapat menambah ketahanan finansial jangka panjang.');
        }
        if (s.length === 0) s.push('Kondisi keuangan pada periode ini terlihat stabil. Terus pantau secara berkala untuk menjaga konsistensi.');
        return s;
      }
      async exportPdf() {
        const btn = document.getElementById('exportPdfBtn');
        if (!btn) return;
        const original = btn.innerHTML;
        btn.innerHTML = 'Menyiapkan PDF...';
        btn.disabled = true;
        try {
          this.renderReports();
          await new Promise((r) => setTimeout(r, 250));
          const el = document.getElementById('reportContent');
          if (!el) throw new Error('Report content tidak ditemukan');
          const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pageWidth = 210;
          const pageHeight = 297;
          const imgWidth = pageWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          pdf.save(`Laporan-CashMoney-${this.range.start}_${this.range.end}.pdf`);
          toast('PDF berhasil diunduh');
        } catch (err) {
          console.error(err);
          toast('Gagal membuat PDF', 'err');
        } finally {
          btn.innerHTML = original;
          btn.disabled = false;
        }
      }
    }

    const app = new App(initialView);
    
    // Start progress bar animation
    const startProgress = () => {
      const progressBar = document.querySelector('.splash-progress-bar::after');
      const progressText = document.getElementById('progressPercent');
      const startTime = Date.now();
      const duration = 50000; // 50 seconds in ms

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const percent = Math.min(Math.round((elapsed / duration) * 100), 100);
        
        if (progressText) {
          progressText.textContent = percent;
        }

        if (elapsed < duration) {
          requestAnimationFrame(updateProgress);
        }
      };

      updateProgress();
    };

    startProgress();
    app.init();
    window.__cashApp = app;
  }, [initialView]);

  return (
    <div className="min-h-screen text-ink">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
