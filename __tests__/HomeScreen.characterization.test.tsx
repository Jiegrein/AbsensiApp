/**
 * Characterization tests (playbook R2) for HomeScreen: which of the four actions are
 * tappable in each work/break state, what the status line says, and what each tap
 * passes to the Scanner screen.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../src/screens/HomeScreen';
import ScanEnum from '../src/Enum/ScanEnum';

jest.mock('@react-navigation/native', () => ({ useIsFocused: () => true }));

const navigation = { navigate: jest.fn() };

const renderHome = (workStatus: boolean, breakStatus: boolean) =>
  render(
    <HomeScreen
      route={{ params: { idParam: 'w-1', workStatusParam: workStatus, breakStatusParam: breakStatus } } as any}
      navigation={navigation as any}
    />
  );

const ACTIONS = ['Mulai Bekerja', 'Selesai Bekerja', 'Mulai Istirahat', 'Selesai Istirahat'];

/** Reads each action's label and whether it is tappable (Pressable exposes `disabled` via accessibilityState). */
const actionTable = (screen: Awaited<ReturnType<typeof render>>) =>
  ACTIONS.map((label) => {
    const pressable = screen.getByText(label).parent!;
    return [label, pressable.props.accessibilityState?.disabled === true ? 'disabled' : 'enabled'] as const;
  });

beforeEach(() => navigation.navigate.mockClear());

describe('actions available per state', () => {
  it('not working: only "Mulai Bekerja" is enabled', async () => {
    const screen = await renderHome(false, false);
    expect(actionTable(screen)).toEqual([
      ['Mulai Bekerja', 'enabled'],
      ['Selesai Bekerja', 'disabled'],
      ['Mulai Istirahat', 'disabled'],
      ['Selesai Istirahat', 'disabled'],
    ]);
    expect(screen.getByText('Tidak Bekerja')).toBeTruthy();
  });

  it('working: "Selesai Bekerja" and "Mulai Istirahat" are enabled', async () => {
    const screen = await renderHome(true, false);
    expect(actionTable(screen)).toEqual([
      ['Mulai Bekerja', 'disabled'],
      ['Selesai Bekerja', 'enabled'],
      ['Mulai Istirahat', 'enabled'],
      ['Selesai Istirahat', 'disabled'],
    ]);
    expect(screen.getByText('Sedang Bekerja')).toBeTruthy();
  });

  it('on break: only "Selesai Istirahat" is enabled', async () => {
    const screen = await renderHome(true, true);
    expect(actionTable(screen)).toEqual([
      ['Mulai Bekerja', 'disabled'],
      ['Selesai Bekerja', 'disabled'],
      ['Mulai Istirahat', 'disabled'],
      ['Selesai Istirahat', 'enabled'],
    ]);
    expect(screen.getByText('Sedang Istirahat')).toBeTruthy();
  });

  it('break without work shows the break status and the not-working layout', async () => {
    // Pinned as-is: workStatus=false wins for the layout, breakStatus=true wins for the text.
    const screen = await renderHome(false, true);
    expect(actionTable(screen)[0]).toEqual(['Mulai Bekerja', 'enabled']);
    expect(screen.getByText('Sedang Istirahat')).toBeTruthy();
  });
});

describe('navigation to Scanner', () => {
  it.each([
    [false, false, 'Mulai Bekerja', ScanEnum.Start_Work],
    [true, false, 'Selesai Bekerja', ScanEnum.End_Work],
    [true, false, 'Mulai Istirahat', ScanEnum.Start_Break],
    [true, true, 'Selesai Istirahat', ScanEnum.End_Break],
  ])('work=%s break=%s: "%s" opens Scanner with scanEnum %i and the current status', async (work, brk, label, scanEnum) => {
    const screen = await renderHome(work, brk);
    await fireEvent.press(screen.getByText(label));
    expect(navigation.navigate).toHaveBeenCalledWith('Scanner', {
      idParam: 'w-1',
      scanEnumParam: scanEnum,
      workStatusParam: work,
      breakStatusParam: brk,
    });
  });
});
