import { CommonColors } from '@/components/CommonStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const DAYS   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

interface Props {
  visible: boolean;
  value: string;       // YYYY-MM-DD or ''
  onConfirm: (iso: string) => void;
  onCancel: () => void;
}

export default function CalendarPicker({ visible, value, onConfirm, onCancel }: Props) {
  const today    = new Date();
  const initial  = value ? new Date(value.slice(0, 10) + 'T12:00:00') : new Date(2000, 0, 1);
  const [year,  setYear]  = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const [sel,   setSel]   = useState<string>(value);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const toISO = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const isFuture = (d: number) => new Date(year, month, d) > today;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={s.backdrop} onPress={onCancel}>
        <Pressable style={s.card} onPress={e => e.stopPropagation()}>

          {/* Month navigation */}
          <View style={s.header}>
            <Pressable onPress={prevMonth} style={s.arrow}>
              <IconSymbol name="chevron.left" size={18} color={CommonColors.black} />
            </Pressable>
            <Text style={s.title}>{MONTHS[month]} {year}</Text>
            <Pressable onPress={nextMonth} style={s.arrow}>
              <IconSymbol name="chevron.right" size={18} color={CommonColors.black} />
            </Pressable>
          </View>

          {/* Day names */}
          <View style={s.row}>
            {DAYS.map(d => (
              <Text key={d} style={s.dayName}>{d}</Text>
            ))}
          </View>

          {/* Day grid */}
          {Array.from({ length: cells.length / 7 }, (_, r) => (
            <View key={r} style={s.row}>
              {cells.slice(r * 7, r * 7 + 7).map((day, c) => {
                if (!day) return <View key={c} style={s.cell} />;
                const iso     = toISO(day);
                const isToday = iso === today.toISOString().split('T')[0];
                const isSel   = iso === sel;
                const future  = isFuture(day);
                return (
                  <Pressable
                    key={c}
                    style={[s.cell, isSel && s.selCell, isToday && !isSel && s.todayCell]}
                    disabled={future}
                    onPress={() => setSel(iso)}
                  >
                    <Text style={[s.dayNum, isSel && s.selText, future && s.futureText]}>
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}

          {/* Actions */}
          <View style={s.actions}>
            <Pressable style={s.cancelBtn} onPress={onCancel}>
              <Text style={s.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[s.confirmBtn, !sel && s.confirmDisabled]}
              disabled={!sel}
              onPress={() => { if (sel) onConfirm(sel); }}
            >
              <Text style={s.confirmText}>Confirmar</Text>
            </Pressable>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  card:           { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: 320, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, elevation: 8 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  arrow:          { padding: 6 },
  title:          { fontSize: 16, fontWeight: '600', color: CommonColors.black },
  row:            { flexDirection: 'row', marginBottom: 2 },
  dayName:        { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: '#888', paddingVertical: 4 },
  cell:           { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 100, margin: 1 },
  selCell:        { backgroundColor: '#E3342F' },
  todayCell:      { borderWidth: 1, borderColor: '#E3342F' },
  dayNum:         { fontSize: 14, color: CommonColors.black },
  selText:        { color: '#fff', fontWeight: '700' },
  futureText:     { color: '#ccc' },
  actions:        { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn:      { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center' },
  cancelText:     { fontSize: 14, fontWeight: '500', color: CommonColors.black },
  confirmBtn:     { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#E3342F', alignItems: 'center' },
  confirmDisabled:{ opacity: 0.4 },
  confirmText:    { fontSize: 14, fontWeight: '600', color: '#fff' },
});
