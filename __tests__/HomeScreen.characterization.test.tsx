/**
 * Characterization tests (playbook R2) for HomeScreen: which of the four actions are
 * tappable in each work/break state, what the status line says, and what each tap
 * passes to the Scanner screen.
 */
import React from 'react';
import { Pressable, Text } from 'react-native';
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

/** Reads each action's label and whether it is tappable. */
const actionTable = (screen: ReturnType<typeof render>) =>
  screen.UNSAFE_getAllByType(Pressable).map((pressable) => {
    const label = pressable.findAllByType(Text)[0].props.children as string;
    return [label, pressable.props.disabled === true ? 'disabled' : 'enabled'] as const;
  });

beforeEach(() => navigation.navigate.mockClear());

describe('actions available per state', () => {
  it('not working: only "Mulai Bekerja" is enabled', () => {
    const screen = renderHome(false, false);
    expect(actionTable(screen)).toEqual([
      ['Mulai Bekerja', 'enabled'],
      ['Selesai Bekerja', 'disabled'],
      ['Mulai Istirahat', 'disabled'],
      ['Selesai Istirahat', 'disabled'],
    ]);
    expect(screen.getByText('Tidak Bekerja')).toBeTruthy();
  });

  it('working: "Selesai Bekerja" and "Mulai Istirahat" are enabled', () => {
    const screen = renderHome(true, false);
    expect(actionTable(screen)).toEqual([
      ['Mulai Bekerja', 'disabled'],
      ['Selesai Bekerja', 'enabled'],
      ['Mulai Istirahat', 'enabled'],
      ['Selesai Istirahat', 'disabled'],
    ]);
    expect(screen.getByText('Sedang Bekerja')).toBeTruthy();
  });

  it('on break: only "Selesai Istirahat" is enabled', () => {
    const screen = renderHome(true, true);
    expect(actionTable(screen)).toEqual([
      ['Mulai Bekerja', 'disabled'],
      ['Selesai Bekerja', 'disabled'],
      ['Mulai Istirahat', 'disabled'],
      ['Selesai Istirahat', 'enabled'],
    ]);
    expect(screen.getByText('Sedang Istirahat')).toBeTruthy();
  });

  it('break without work shows the break status and the not-working layout', () => {
    // Pinned as-is: workStatus=false wins for the layout, breakStatus=true wins for the text.
    const screen = renderHome(false, true);
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
  ])('work=%s break=%s: "%s" opens Scanner with scanEnum %i and the current status', (work, brk, label, scanEnum) => {
    const screen = renderHome(work, brk);
    fireEvent.press(screen.getByText(label));
    expect(navigation.navigate).toHaveBeenCalledWith('Scanner', {
      idParam: 'w-1',
      scanEnumParam: scanEnum,
      workStatusParam: work,
      breakStatusParam: brk,
    });
  });
});
